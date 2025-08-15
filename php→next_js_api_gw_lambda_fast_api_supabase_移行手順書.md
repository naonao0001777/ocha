# PHP + Apache から Next.js + API Gateway + Lambda(FastAPI) + Supabase(PostgreSQL/Storage) への移行手順書

この文書は、既存の **PHP + Apache** モノリシックアプリを、**Next.js（Vercel） + AWS API Gateway + Lambda(FastAPI/Python) + Supabase(PostgreSQL/Storage/Auth)** へ移行するための実践的ステップをまとめたものです。**無料枠／低コスト前提**で、スモールスタートできる構成を採用しています。

---

## 0. ゴールと全体像

- **フロント**：Next.js（Vercel）
- **API**：AWS API Gateway(HTTP API) → Lambda（FastAPI + Mangum）
- **DB**：Supabase PostgreSQL（無料枠）
- **Auth**：Supabase Auth（JWT）
- **ファイル**：Supabase Storage（無料枠、署名URLで直アップロード）
- **IaC**：Terraform（AWS 側：API GW / Lambda / IAM / Secrets）

```
[User]
  │
  │  https://example.com/u/{userId}
  ▼
[Vercel / Next.js] ── fetch ──▶ [API Gateway] ─▶ [Lambda(FastAPI)] ─▶ [Supabase(Postgres/Auth/Storage)]
                                                └─────────▶ [Supabase Storage 署名URL → ブラウザ直PUT]
```

---

## 1. 現行調査（PHP + Apache）

1. **機能一覧**（画面・API）を洗い出し、優先度付け（MVP → Nice-to-have）。
2. **URLルーティング**（例：`/u/{user_id}`）とクエリ/フォームパラメータを棚卸し。
3. **DBスキーマ**（テーブル、主キー、外部キー、ユニーク制約）を ER 図化。
4. **ファイル入出力**（アップロード先、ファイル命名規則、公開/非公開区分）。
5. **認証/権限**（ユーザー登録、ログイン、セッション/クッキーの扱い）。
6. **環境変数/設定**（鍵、エンドポイント、秘密情報）。

> ✅ 移行対象の最小機能（MVP）を先に決め、段階リリース可能な粒度に分割します。
問題点: Apacheの設定ファイルやPHPのコードベースが大きく、特にURLルーティングやセッション管理の部分で依存関係が多いことが問題です。
Apacheは完全撤去し、Next.jsとAPI Gatewayを中心にした新しいアーキテクチャに移行する必要があります。
Apacheの役割としてはほとんどアカウントを作成したユーザーがアクセスするための生成された画像フォルダへのアクセス、リライト機能が中心であり、これをNext.jsの動的ルーティングとAPI Gatewayで実現する必要があります。
---

## 2. 新アーキテクチャの要件定義

- **URL方針**
  - 表示URL：`/u/{userId}`（Next.js の動的ルーティング）
  - API URL：`/users/{id}`（REST）
- **認証**：Supabase Auth（メールリンク or OAuth）。フロントは Supabase JS SDK を使用。
- **権限**：RLS（Row-Level Security）で DB 側制御。Storage もポリシーで制御。
- **CORS**：API Gateway と Supabase Storage の両方でオリジン許可。
- **セキュリティ**：JWT（Bearer）でステートレス。秘密鍵は AWS Secrets Manager。

---

## 3. Supabase セットアップ

1. Supabase プロジェクト作成（Organization → Project）。
2. **PostgreSQL**
   - 初期テーブル例：

```sql
create table public.users (
  id bigint generated always as identity primary key,
  auth_uid uuid unique, -- supabase auth のユーザーIDを格納
  name text not null,
  created_at timestamptz default now()
);

-- RLS 有効化
alter table public.users enable row level security;

-- 自分のレコードのみ参照/更新可（例）
create policy "select_own" on public.users
  for select using (auth.uid() = auth_uid);
create policy "update_own" on public.users
  for update using (auth.uid() = auth_uid);
```

3. **Auth**

   - Email 認証 or OAuth を有効化。
   - フロント（Next.js）で Supabase クライアントを設定。

4. **Storage**

   - バケット作成：例 `files`
   - RLS/ポリシー例（公開アップロードは不可、署名URL経由）：

```sql
-- 例: ストレージの公開読み取りはせず、アプリから署名URLを発行
-- Supabase Storage はポリシーを Storage 用の UI または SQL で設定
```

> 🔐 \*\*API キー（anon / service\_role）\*\*をメモ。Lambda では基本 `service_role` を Secrets Manager に保存し、署名URLの発行などサーバー側権限で実行します。

---

## 4. Next.js（Vercel）実装

### 4.1 プロジェクト作成

```bash
npx create-next-app@latest myapp --ts --app
cd myapp
```

### 4.2 Supabase クライアント

```bash
npm i @supabase/supabase-js
```

`lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

`.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com
```

### 4.3 動的ルート `/u/[userId]`

`app/u/[userId]/page.tsx`

```tsx
export default async function Page({ params }: { params: { userId: string } }) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${params.userId}`, { cache: 'no-store' })
  if (!r.ok) return <h1>Not Found</h1>
  const user = await r.json()
  return (
    <main>
      <h1>{user.name}</h1>
      <p>ID: {user.id}</p>
    </main>
  )
}
```

### 4.4 署名URLでのアップロード（フロント側）

```tsx
async function upload(file: File) {
  const presign = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/files/presign`, { method: 'POST' })
  const { uploadUrl, key } = await presign.json()
  const put = await fetch(uploadUrl, { method: 'PUT', body: file })
  if (!put.ok) throw new Error('upload failed')
  return key
}
```

> ISR/SSR を使い分けて API コールを削減し、無料枠を節約します。

---

## 5. FastAPI（Lambda）実装

### 5.1 依存（例）

`requirements.txt`

```
fastapi
uvicorn
mangum
httpx
supabase
python-dotenv
```

### 5.2 ディレクトリ

```
api/
  app.py
  handler.py
```

### 5.3 コード

`api/app.py`

```py
import os
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI()

def get_sb() -> Client:
  url = os.environ['SUPABASE_URL']
  key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
  return create_client(url, key)

class UserIn(BaseModel):
  name: str

@app.get('/users/{user_id}')
async def get_user(user_id: int, sb: Client = Depends(get_sb)):
  res = sb.table('users').select('id,name').eq('id', user_id).single().execute()
  if not res.data:
    raise HTTPException(404, 'not found')
  return res.data

@app.post('/users')
async def create_user(payload: UserIn, sb: Client = Depends(get_sb)):
  ins = sb.table('users').insert({'name': payload.name}).select('id').single().execute()
  return {'id': ins.data['id']}

@app.post('/files/presign')
async def presign(sb: Client = Depends(get_sb)):
  bucket = os.environ.get('FILES_BUCKET', 'files')
  from datetime import datetime
  key = f"uploads/{int(datetime.utcnow().timestamp())}"
  # Supabase Python SDK は Storage の署名URL発行に対応
  url = sb.storage.from_(bucket).create_signed_upload_url(key)
  return {'uploadUrl': url['signedUrl'], 'key': key}
```

`api/handler.py`

```py
from mangum import Mangum
from .app import app
handler = Mangum(app)
```

> 注: SDK のバージョンによって Storage の署名URL API が異なる場合があります。必要に応じて REST エンドポイントを直接叩くか、`create_signed_url` を使用してください。

### 5.4 実行（ローカル）

```bash
uvicorn api.app:app --reload --port 8000
```

---

## 6. Terraform（AWS 側最小構成）

> ここでは **Lambda（ZIPデプロイ）** + **API Gateway HTTP API** + **IAM** + **Secrets Manager** を最小で示します。ECR コンテナ方式でも可。

`infra/main.tf`

```hcl
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  required_version = ">= 1.6.0"
}
provider "aws" { region = var.region }
```

`infra/variables.tf`

```hcl
variable "region" { type = string }
variable "project" { type = string }
variable "supabase_url" { type = string }
variable "supabase_service_role_key" { type = string }
variable "files_bucket" { type = string default = "files" }
```

`infra/iam.tf`

```hcl
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-lambda-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}
resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
```

`infra/lambda.tf`

```hcl
resource "aws_lambda_function" "api" {
  function_name = "${var.project}-api"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "python3.11"
  handler       = "api/handler.handler"
  timeout       = 15
  memory_size   = 1024

  filename         = "../dist/api.zip"          # CIで作成
  source_code_hash = filebase64sha256("../dist/api.zip")

  environment {
    variables = {
      SUPABASE_URL               = var.supabase_url
      SUPABASE_SERVICE_ROLE_KEY  = var.supabase_service_role_key
      FILES_BUCKET               = var.files_bucket
    }
  }
}
```

`infra/apigw.tf`

```hcl
resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-http"
  protocol_type = "HTTP"
}
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_route" "routes" {
  for_each = toset([
    "GET /users/{id}",
    "POST /users",
    "POST /files/presign"
  ])
  api_id    = aws_apigatewayv2_api.http.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
```

> CORS は API Gateway 側で簡易設定可能ですが、必要に応じて `Access-Control-Allow-*` ヘッダを Lambda で明示的に返してください。

---

## 7. データ移行

1. 旧DBから **CSV/TSV** でエクスポート。
2. Supabase の SQL Editor or `psql` でインポート。
   - 例：

```sql
\copy public.users(name) FROM 'users.csv' WITH (FORMAT csv, HEADER true);
```

3. 旧ユーザーIDと新IDのマッピングテーブルを作り、フロントURL `/u/{userId}` との整合性を取る。
4. Auth を使う場合は `auth.users`（Supabase 内部）と `public.users.auth_uid` の紐付けを移行スクリプトで実施。

---

## 8. 認証・認可（Supabase Auth + RLS）

- フロント：Supabase JS でログイン / セッション管理。
- API：Bearer JWT を受け取り、必要に応じて Supabase の `get_user()` で検証（**サーバー側では service\_role で DB 直叩きする場合は過権限に注意**）。
- RLS：DB 側で **「本人のみ読める/更新できる」** を保証。Lambda 側での条件分岐は最小に。

---

## 9. Vercel / AWS / Supabase デプロイ手順

1. **Supabase**：DB/Storage/Auth 設定完了、URL/Keys を取得。
2. **Lambda パッケージ**：
   - `dist/api.zip` を CI で作成（`pip install -r requirements.txt -t ./package && zip -r dist/api.zip api package` など）。
3. **Terraform**：
   - `terraform init && terraform apply`
   - 出力の API エンドポイントを控える。
4. **Vercel(Next.js)**：
   - `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を環境変数設定。
   - デプロイ。

---

## 10. 動作確認

- `GET /users/{id}`：ユーザー取得
- `POST /users`：作成（200/201）
- `POST /files/presign` → 取得した `uploadUrl` に対して PUT（ブラウザから）
- `/u/{userId}` ページでの描画

---

## 11. 切替（カットオーバー）

1. 旧サイトの **メンテ告知**。
2. 最終データ差分のインポート。
3. DNS 切替（`example.com` → Vercel / `api.example.com` → API GW）。
4. 監視（Vercel Analytics / API GW & Lambda CloudWatch / Supabase ダッシュボード）。
5. 旧 Apache の段階停止（404 → 新URL案内）。

---

## 12. 無料枠と運用のヒント

- **API 呼び出し削減**：Next.js の ISR/SSG を活用。クライアント側でキャッシュ。
- **接続数**：Supabase の接続上限に注意。Lambda は短時間で多接続になりがち → 極力 REST 経由（SDK）で操作。
- **ファイル肥大化**：Storage 上限（1GB）を超えないよう、古いファイルの GC（定期削除）ルールを運用。
- **Secrets**：AWS Secrets Manager で Supabase の service\_role を安全に管理。
- **監視**：無料範囲の CloudWatch Logs と Supabase Usage を定期チェック。

---

## 13. ロールバック方針

- DNS 戻し：`api.example.com` を旧APIへ戻す CNAME を準備。
- データ：移行後に発生したデータを差分エクスポート（Supabase → 旧DB 逆流）できるように INSERT/UPDATE ログを記録。
- フロント：Vercel の前バージョンに即座に Revert。

---

## 付録A：CORS（簡易レスポンス例）

FastAPI での CORS ミドルウェア：

```py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
  CORSMiddleware,
  allow_origins=["https://example.com", "https://*.vercel.app"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)
```

---

## 付録B：API レスポンスの型（例）

```json
GET /
```
