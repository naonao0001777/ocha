# デプロイメントチェックリスト

本番環境へのデプロイ前に以下の項目をチェックしてください。

## 🔧 事前準備

- [ ] Supabase プロジェクトが作成済み
- [ ] Supabase のURL、キーが取得済み
- [ ] AWS CLI が設定済み（`aws configure`）
- [ ] Terraform >= 1.6.0 がインストール済み
- [ ] Node.js >= 18 がインストール済み

## 📊 データベース設定

- [ ] Supabase でテーブルが作成済み（users, links, social_accounts）
- [ ] 必要なインデックスが作成済み
- [ ] ストレージバケット（profile-images）が作成済み
- [ ] RLS（Row Level Security）ポリシーが設定済み（必要に応じて）

## 🏗️ インフラストラクチャ

- [ ] `infra/terraform.tfvars` ファイルが作成済み
- [ ] Terraform変数が正しく設定済み
  - [ ] `region`
  - [ ] `project`
  - [ ] `environment` 
  - [ ] `supabase_url`
  - [ ] `supabase_service_role_key`
  - [ ] `files_bucket`

## 🔐 セキュリティ

- [ ] 強力な JWT_SECRET_KEY が設定済み
- [ ] Supabase Service Role Key が安全に管理されている
- [ ] CORS設定が適切なドメインに制限されている
- [ ] 本番環境用の環境変数が設定済み

## 🚀 デプロイメント

- [ ] Lambda パッケージが正常に作成される（`./scripts/build-lambda.sh`）
- [ ] Terraform plan が成功する
- [ ] AWS リソースが正常にデプロイされる
- [ ] API Gateway URL が取得される
- [ ] Vercel プロジェクトが作成済み
- [ ] Vercel の環境変数が設定済み
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_API_BASE`

## ✅ 動作確認

- [ ] API ヘルスチェックが成功（`GET /health`）
- [ ] API ドキュメントが表示される（`GET /docs`）
- [ ] フロントエンドが正常にロードされる
- [ ] ユーザー登録機能が動作する
- [ ] ログイン機能が動作する
- [ ] プロフィール作成・編集が動作する
- [ ] 画像アップロード機能が動作する（予定機能の場合）

## 📊 監視・ログ

- [ ] CloudWatch Logs でLambda関数のログが確認できる
- [ ] API Gateway のアクセスログが確認できる
- [ ] Vercel Analytics が設定されている（オプション）
- [ ] エラーアラートが設定されている（オプション）

## 🔄 ロールバック準備

- [ ] 前バージョンの情報が記録されている
- [ ] ロールバック手順が文書化されている
- [ ] DNS切り戻し手順が準備されている（カスタムドメイン使用時）

## 📈 パフォーマンス

- [ ] Lambda関数のタイムアウト設定が適切
- [ ] Lambda関数のメモリ設定が適切
- [ ] API Gateway のスロットリング設定が適切（必要に応じて）
- [ ] フロントエンドの静的アセット最適化が完了

## 🧪 テストケース

- [ ] API エンドポイントの基本テスト
- [ ] エラーハンドリングのテスト
- [ ] 認証・認可のテスト
- [ ] CORS動作のテスト
- [ ] レスポンシブデザインのテスト

## 📝 ドキュメント

- [ ] デプロイ手順書の更新
- [ ] API仕様書の更新
- [ ] 環境変数一覧の更新
- [ ] トラブルシューティングガイドの更新

## 💡 デプロイ後のタスク

- [ ] 本番環境での動作確認
- [ ] パフォーマンス監視の開始
- [ ] ユーザーへのリリース通知
- [ ] 旧環境の停止スケジュール設定

---

## 緊急時の連絡先

- AWS サポート: [AWSサポートセンター](https://console.aws.amazon.com/support/)
- Vercel サポート: [Vercelヘルプ](https://vercel.com/help)
- Supabase サポート: [Supabaseサポート](https://supabase.com/support)

---

**重要**: 本番環境でのテストは十分に注意して実行してください。可能な限り、ステージング環境での事前テストを推奨します。