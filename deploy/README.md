# デプロイガイド

このガイドでは、Next.js + FastAPI + Supabase アプリケーションを本番環境にデプロイする手順を説明します。

## 前提条件

- AWS CLI が設定済み
- Terraform >= 1.6.0 がインストール済み
- Node.js >= 18 がインストール済み
- Supabase プロジェクトが作成済み

## 1. Supabase セットアップ

### 1.1 プロジェクト作成
1. [Supabase Dashboard](https://app.supabase.com) でプロジェクト作成
2. 以下の情報を控える：
   - `SUPABASE_URL`: プロジェクトURL
   - `SUPABASE_ANON_KEY`: 匿名キー
   - `SUPABASE_SERVICE_ROLE_KEY`: サービスロールキー

### 1.2 データベース設定
```sql
-- SQLエディターで実行

-- ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash TEXT,
    biography TEXT,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- リンクテーブル
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ソーシャルアカウントテーブル
CREATE TABLE social_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- インデックス
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
```

### 1.3 Storage設定
1. ダッシュボードで `profile-images` バケット作成
2. 必要に応じてアクセスポリシーを設定

## 2. AWS Lambda + API Gateway デプロイ

### 2.1 環境設定
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` を編集：
```hcl
region                    = "ap-northeast-1"
project                   = "ocha"
environment               = "prod"
supabase_url              = "https://your-project.supabase.co"
supabase_service_role_key = "your-service-role-key"
files_bucket              = "profile-images"
```

### 2.2 Terraformデプロイ
```bash
# Lambdaパッケージの作成（必要に応じて）
cd ..
./scripts/build-lambda.sh

# インフラデプロイ
cd infra
terraform init
terraform plan
terraform apply
```

### 2.3 API Gateway URL確認
```bash
terraform output api_gateway_url
```

## 3. Next.js (Vercel) デプロイ

### 3.1 Vercelプロジェクト作成
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

### 3.2 環境変数設定
Vercelダッシュボードまたはコマンドラインで設定：

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add NEXT_PUBLIC_API_BASE
```

値：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名キー
- `NEXT_PUBLIC_API_BASE`: Terraform出力のAPI Gateway URL

### 3.3 デプロイ
```bash
vercel --prod
```

## 4. 動作確認

### 4.1 API確認
```bash
curl https://your-api-gateway-url/health
```

### 4.2 フロントエンド確認
1. Vercel URLにアクセス
2. ユーザー登録・ログイン機能をテスト
3. プロフィール作成・編集をテスト

## 5. 監視とログ

### 5.1 CloudWatch Logs
- Lambda関数のログは CloudWatch Logs で確認
- ロググループ: `/aws/lambda/ocha-prod-api`

### 5.2 Vercel Analytics
- Vercelダッシュボードでアクセス解析確認

## 6. トラブルシューティング

### Lambda関数のタイムアウト
- `lambda.tf` の `timeout` を調整
- `terraform apply` で再デプロイ

### CORS エラー
- `app.py` の CORS設定を確認
- API Gateway の CORS設定を確認

### データベース接続エラー
- Supabase接続情報を確認
- Lambda環境変数を確認

## 7. 更新時の手順

### APIの更新
```bash
# パッケージ再作成
./scripts/build-lambda.sh

# Lambda関数更新
cd infra
terraform apply
```

### フロントエンドの更新
```bash
cd frontend
vercel --prod
```

## 8. セキュリティ

### 本番環境での推奨事項
1. CORS設定を適切なドメインに制限
2. JWT_SECRET_KEY を強力な値に設定
3. Supabase RLS (Row Level Security) を有効化
4. API Gateway のスロットリング設定
5. CloudWatch アラーム設定

## 9. スケーリング

### Lambda
- 同時実行数制限の設定
- 予約済み同時実行数の設定

### API Gateway
- スロットリング設定
- 使用量プランの設定

### Supabase
- 接続プーリング設定
- パフォーマンス監視