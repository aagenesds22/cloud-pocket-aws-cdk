variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "cloudpocket"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "cloudpocket_associations_and_objects"
}

variable "db_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "cloudpocket_admin"
}

variable "db_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}
