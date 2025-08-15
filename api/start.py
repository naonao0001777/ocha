#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

def main():
    """FastAPI開発サーバーを起動"""
    try:
        import uvicorn
        from app import app
        
        # 環境変数の確認
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            print("⚠️  Warning: Supabase環境変数が設定されていません")
            print("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY を .env ファイルに設定してください")
        
        print("🚀 FastAPI サーバーを起動中...")
        print(f"   URL: http://localhost:8000")
        print(f"   API Docs: http://localhost:8000/docs")
        print("   CTRL+C で停止")
        
        uvicorn.run(
            "app:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except ImportError:
        print("❌ 必要なパッケージがインストールされていません")
        print("   pip install -r requirements.txt を実行してください")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 サーバーを停止しました")
    except Exception as e:
        print(f"❌ サーバー起動エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()