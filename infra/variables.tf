variable "region" { 
  type        = string
  default     = "ap-northeast-1"
  description = "AWS region for deployment"
}

variable "project" { 
  type        = string
  default     = "ocha"
  description = "Project name for resource naming"
}

variable "supabase_url" { 
  type        = string
  description = "Supabase project URL"
}

variable "supabase_service_role_key" { 
  type        = string
  sensitive   = true
  description = "Supabase service role key"
}

variable "files_bucket" { 
  type        = string 
  default     = "files"
  description = "Supabase storage bucket name"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Environment name"
}