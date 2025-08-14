#!/bin/bash
# 本番環境へのデプロイスクリプト

set -e

echo "🚀 Ocha アプリケーションのデプロイを開始..."

# 作業ディレクトリの設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 設定ファイルの確認
if [ ! -f "$PROJECT_ROOT/infra/terraform.tfvars" ]; then
    echo "❌ terraform.tfvars が見つかりません"
    echo "   infra/terraform.tfvars.example をコピーして設定してください"
    exit 1
fi

echo "📦 1. Lambda パッケージを作成中..."
cd "$PROJECT_ROOT"
./scripts/build-lambda.sh

echo "🏗️  2. AWS インフラをデプロイ中..."
cd "$PROJECT_ROOT/infra"

# Terraformの初期化（初回のみ）
if [ ! -d ".terraform" ]; then
    echo "   Terraform を初期化中..."
    terraform init
fi

# プランの確認
echo "   デプロイ計画を確認中..."
terraform plan -out=tfplan

# ユーザー確認
echo ""
echo "⚠️  上記のプランでデプロイを実行しますか？"
echo "   Enter を押すと続行、Ctrl+C でキャンセル"
read -r

# デプロイ実行
echo "   インフラをデプロイ中..."
terraform apply tfplan

# API Gateway URL を取得
API_GATEWAY_URL=$(terraform output -raw api_gateway_url)
echo "✅ API Gateway URL: $API_GATEWAY_URL"

echo ""
echo "🌐 3. Next.js フロントエンドをデプロイ中..."
echo "   以下の環境変数を Vercel に設定してください："
echo "   NEXT_PUBLIC_API_BASE=$API_GATEWAY_URL"
echo ""

cd "$PROJECT_ROOT/frontend"

# Vercelがインストールされているか確認
if ! command -v vercel &> /dev/null; then
    echo "   Vercel CLI をインストール中..."
    npm install -g vercel
fi

# 環境変数が設定されているか確認
echo "   環境変数を確認中..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  以下の環境変数を設定してください："
    echo "   export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "   export NEXT_PUBLIC_API_BASE=$API_GATEWAY_URL"
    echo ""
    echo "   設定後、以下のコマンドでVercelにデプロイしてください："
    echo "   cd $PROJECT_ROOT/frontend && vercel --prod"
else
    echo "   Vercel にデプロイ中..."
    export NEXT_PUBLIC_API_BASE="$API_GATEWAY_URL"
    vercel --prod
fi

echo ""
echo "✅ デプロイが完了しました！"
echo ""
echo "📋 デプロイ結果:"
echo "   API エンドポイント: $API_GATEWAY_URL"
echo "   ヘルスチェック: $API_GATEWAY_URL/health"
echo "   API ドキュメント: $API_GATEWAY_URL/docs"
echo ""
echo "🔧 次のステップ:"
echo "   1. API エンドポイントの動作確認"
echo "   2. フロントエンドの動作確認"  
echo "   3. 必要に応じてドメインの設定"
echo "   4. 監視・アラートの設定"