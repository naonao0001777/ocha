# 環境変数でCORSオリジンを制御
locals {
  cors_origins = var.environment == "prod" ? [
    "https://ocha.onrender.com",
    "https://ocha-navy.vercel.app"
  ] : [
    "http://localhost:3000",
    "http://localhost:3001"
  ]
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-${var.environment}-http-api"
  protocol_type = "HTTP"
  description   = "HTTP API for ${var.project} ${var.environment}"

  cors_configuration {
    allow_credentials = false
    allow_headers = [
      "Accept",
      "Accept-Language",
      "Content-Language", 
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ]
    allow_methods = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"]
    allow_origins = local.cors_origins  # ✅ 環境別制限
    max_age       = 86400
  }

  tags = {
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# キャッチオールルート（FastAPIがルーティングを処理）
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# 明示的にAPIエンドポイント用のルートも定義
resource "aws_apigatewayv2_route" "api_routes" {
  for_each = toset([
    "GET /users/{id}",
    "POST /users",
    "POST /files/presign",
    "GET /health",
    "GET /docs",
    "GET /openapi.json"
  ])
  
  api_id    = aws_apigatewayv2_api.http.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}