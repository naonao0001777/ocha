resource "aws_lambda_function" "api" {
  function_name = "${var.project}-${var.environment}-api"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "python3.11"
  handler       = "lambda_function.lambda_handler"
  timeout       = 30
  memory_size   = 512

  filename         = "../dist/api.zip"
  source_code_hash = filebase64sha256("../dist/api.zip")

  environment {
    variables = {
      SUPABASE_URL              = var.supabase_url
      SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key
      FILES_BUCKET              = var.files_bucket
      ENVIRONMENT               = var.environment
      JWT_SECRET_KEY            = "3f1ee43c48627577bb9810de44e26137ef87e55eb8506630cf7058a0fae160c6"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.lambda_logs,
  ]

  tags = {
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project}-${var.environment}-api"
  retention_in_days = 14

  tags = {
    Project = var.project
    Environment = var.environment
  }
}