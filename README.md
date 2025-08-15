# Ocha - プロフィールジェネレータプラットフォーム

## 概要
**Ocha** は、プロフィールジェネレータを提供するWebプラットフォームです。  
当初は PHP + Apache 環境で稼働していましたが、構成のレガシー化と運用上の課題があり、  
フロントエンドとバックエンドを分離し、サーバーレス・スケーラブルなアーキテクチャに刷新しました。

---

## 背景と課題

### 旧構成の問題点
- **インフラ構成**
  - PHP + Apache を Docker コンテナ化し Render にデプロイ
  - PostgreSQL データベース（3ヶ月ごとに破棄される仕様）
  - ファイルアップロードはアプリ環境内ディレクトリに保存（ストレージなし）
- **運用の問題**
  - デプロイは手動（Docker Hub に push → Render で再デプロイ）
  - Apache + PHP の密結合構成で拡張性・保守性が低い
  - URLルーティングを Apache の `.htaccess` で実装
- **スケーラビリティ**
  - サーバー単位のスケールアウトが必要でコスト高

---

## 移行後の構成

### リニューアルのポイント
- フロントエンドとバックエンドを分離
- **バックエンド**: Python + FastAPI + Mangum → AWS Lambda へデプロイ
- **データベース / ストレージ**: Supabase を利用（PostgreSQL + オブジェクトストレージ）
- **IaC化**: Terraform でインフラをコード管理
- **フロントエンド**: Next.js に刷新し、ルーティングを Next.js 側で管理
- **デザイン**: AIによるUIデザイン刷新、モダンなUIに変更

---

## 構成図

### 移行前（旧構成）

[User Browser]
|
Internet
|
[Render PaaS]
├── PHP + Apache (Docker)
│ ├── App Logic
│ └── Local File Uploads
└── PostgreSQL (Ephemeral, 3-month reset)

---

### 移行後（新構成）

[User Browser]
|
Internet
|
[Next.js Frontend] <---> [AWS API Gateway] --> [AWS Lambda (FastAPI + Mangum)]
|
[Supabase]
├── PostgreSQL
└── Storage (file uploads)

---

## 難しかった点
1. **URLルーティング移行**
   - Apache `.htaccess` によるルーティングを Next.js のファイルベースルーティングに移行
2. **サーバーレス化**
   - FastAPI を Mangum 経由で Lambda に適応させる
3. **データ移行**
   - ローカルディレクトリにあったアップロードファイルを Supabase Storage に移行

---

## 利点
- **スケーラブル**: Lambda による自動スケール
- **高パフォーマンス**: API Gateway + Lambda の組み合わせ
- **管理性向上**: Terraform によるIaC
- **永続ストレージ**: Supabase によるDB・ファイル保存

---

## 今後の改善予定
- CI/CD 導入による完全自動デプロイ
- 認証機能の強化（Supabase Auth や Cognito）
- 監視・ログ分析の導入
- AI導入
