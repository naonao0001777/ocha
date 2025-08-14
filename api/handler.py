"""
Lambda handler for FastAPI app using Mangum
"""
import os
import traceback
from mangum import Mangum

# デバッグ用のラッパー関数
def lambda_handler(event, context):
    """Main Lambda handler with error handling"""
    try:
        # app.pyをインポート
        from app import app
        
        # Mangumハンドラーを作成
        handler = Mangum(app, lifespan="off")
        
        # イベントを処理
        return handler(event, context)
    except Exception as e:
        print(f"Lambda handler error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            },
            "body": '{"detail": "Internal server error"}'
        }