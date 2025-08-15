"""
Test Lambda handler for debugging
"""
import os
import traceback
from mangum import Mangum

def lambda_handler(event, context):
    """Test Lambda handler with comprehensive error handling"""
    try:
        print(f"Lambda event: {event}")
        print(f"Lambda context: {context}")
        
        # Import the simple test app
        from simple_test import app
        
        # Create Mangum handler
        handler = Mangum(app, lifespan="off")
        
        # Process the event
        response = handler(event, context)
        print(f"Lambda response: {response}")
        return response
        
    except ImportError as e:
        print(f"Import error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            },
            "body": '{"detail": "Import error in Lambda function"}'
        }
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
            "body": '{"detail": "Internal server error", "error": "' + str(e) + '"}'
        }