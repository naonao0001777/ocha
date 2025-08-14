#!/bin/bash
# Lambda用のデプロイメントパッケージを作成するスクリプト

set -euo pipefail

echo "🏗️  Lambda デプロイメントパッケージを作成中..."

# 作業用ディレクトリの準備
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
DIST_DIR="$PROJECT_ROOT/dist"
API_DIR="$PROJECT_ROOT/api"

# LambdaのPythonランタイムに合わせる
PY_VER="311"               # python3.11
PLATFORM="manylinux2014_x86_64"
ABI="cp${PY_VER}"          # cp311

echo "📁 作業ディレクトリを準備中..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# 依存関係インストール（Linux x86_64 向けのmanylinuxホイールを取得）
echo "📦 Pythonパッケージをインストール中 (platform=$PLATFORM python=$PY_VER)..."
python3 -m pip install --upgrade pip >/dev/null || true
python3 -m pip install \
  --platform "$PLATFORM" \
  --implementation cp \
  --python-version "$PY_VER" \
  --abi "$ABI" \
  --only-binary=:all: \
  -r "$API_DIR/requirements.txt" \
  -t "$BUILD_DIR/package"

# APIコードをコピー
echo "📋 APIコードをコピー中..."
cp "$API_DIR"/*.py "$BUILD_DIR/"

# 不要パッケージの削除（Lambdaでは起動に不要なサーバ実装などを削る）
# 注意: websockets は Supabase realtime が必要とするため削除しない
pushd "$BUILD_DIR/package" >/dev/null
rm -rf uvicorn* uvloop* httptools* || true
popd >/dev/null

# 依存ツリーからテスト/キャッシュ等の不要ファイルを削除してサイズ削減
echo "🧹 依存パッケージをクリーンアップ中..."
find "$BUILD_DIR/package" -type d -name tests -prune -exec rm -rf {} + || true
find "$BUILD_DIR/package" -type d -name "__pycache__" -prune -exec rm -rf {} + || true
find "$BUILD_DIR/package" -type f \( -name "*.pyc" -o -name "*.pyo" \) -delete || true

# ZIP作成
echo "🗜️  ZIPファイルを作成中..."
cd "$BUILD_DIR"
# パッケージディレクトリの内容をルートに配置
cp -r package/* .
rm -rf package

# APIファイルを配置
zip -r "$DIST_DIR/api.zip" . -x "*.pyc" "*/__pycache__/*" "*.git*"

echo "✅ デプロイメントパッケージが作成されました: $DIST_DIR/api.zip"
echo "📊 パッケージサイズ: $(du -h "$DIST_DIR/api.zip" | cut -f1)"

# クリーンアップ
rm -rf "$BUILD_DIR"
echo "🧹 一時ファイルを削除しました"