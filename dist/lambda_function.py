import json
from datetime import datetime

def lambda_handler(event, context):
    """
    Simple Lambda handler that works without complex dependencies
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Get path and method from API Gateway v2.0 format
    path = event.get('rawPath', '/')
    method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
    
    # Handle CORS preflight requests
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            'body': ''
        }
    
    # Simple routing
    if path == '/' and method == 'GET':
        response_body = {
            'message': 'Ocha API',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat()
        }
    elif path == '/health' and method == 'GET':
        response_body = {
            'status': 'healthy',
            'message': 'API is working correctly',
            'timestamp': datetime.utcnow().isoformat()
        }
    elif path == '/test' and method == 'POST':
        try:
            body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        except json.JSONDecodeError:
            body = {}
        
        response_body = {
            'message': 'Test endpoint working',
            'received_data': body,
            'timestamp': datetime.utcnow().isoformat()
        }
    elif path == '/auth/login' and method == 'POST':
        try:
            body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        except json.JSONDecodeError:
            body = {}
        
        # Mock login response
        response_body = {
            'access_token': 'mock_jwt_token_12345',
            'token_type': 'bearer',
            'user': {
                'id': 'mock_user_id',
                'email': body.get('email', 'test@example.com'),
                'user_name': 'testuser'
            }
        }
    elif path.startswith('/users/') and method == 'GET':
        user_id = path.split('/')[-1]
        # Mock user response
        response_body = {
            'id': user_id,
            'user_name': f'user_{user_id}',
            'name': 'Test User',
            'biography': 'This is a test user profile',
            'profile_image': None,
            'created_at': '2025-01-01T00:00:00Z',
            'updated_at': datetime.utcnow().isoformat() + 'Z'
        }
    else:
        # 404 for unknown routes
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            'body': json.dumps({'detail': 'Not Found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': json.dumps(response_body)
    }