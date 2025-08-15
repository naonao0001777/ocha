#!/bin/bash
# Vercel環境変数設定スクリプト

set -e

echo "🔧 Vercel環境変数を設定中..."

cd /Users/naohiro/dev/src/ocha/frontend

# 環境変数の値を設定
SUPABASE_URL="https://apqgpbaudcqywppqdqna.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcWdwYmF1ZGNxeXdwcHFkcW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjIyNTgsImV4cCI6MjA3MDczODI1OH0.RjkibPARsE7MRg2itP11DY4B41pZxYMXFY-XCg_dvRM"
API_BASE="https://hgtalzt5r9.execute-api.ap-northeast-1.amazonaws.com"

echo "環境変数を設定します:"
echo "NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: [設定済み]"
echo "NEXT_PUBLIC_API_BASE: $API_BASE"
echo ""

# 各環境変数を設定
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
echo "$API_BASE" | vercel env add NEXT_PUBLIC_API_BASE production

echo "✅ 環境変数の設定が完了しました"