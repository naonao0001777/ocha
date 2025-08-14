#!/bin/bash
# Lambda用のデプロイメントパッケージを作成するスクリプト

set -e

echo "🏗️  Lambda デプロイメントパッケージを作成中..."

# 作業用ディレクトリの準備
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
DIST_DIR="$PROJECT_ROOT/dist"
API_DIR="$PROJECT_ROOT/api"

echo "📁 作業ディレクトリを準備中..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

echo "📦 Pythonパッケージをインストール中..."
pip3 install -r "$API_DIR/requirements.txt" -t "$BUILD_DIR/package"

echo "📋 APIコードをコピー中..."
cp "$API_DIR"/*.py "$BUILD_DIR/"

echo "🗜️  ZIPファイルを作成中..."
cd "$BUILD_DIR"
# パッケージディレクトリの内容を直接ルートに配置
cp -r package/* .
rm -rf package

# APIファイルを配置
zip -r "$DIST_DIR/api.zip" . -x "*.pyc" "*/__pycache__/*" "*.git*"

echo "✅ デプロイメントパッケージが作成されました: $DIST_DIR/api.zip"
echo "📊 パッケージサイズ: $(du -h "$DIST_DIR/api.zip" | cut -f1)"

# クリーンアップ
rm -rf "$BUILD_DIR"
echo "🧹 一時ファイルを削除しました"