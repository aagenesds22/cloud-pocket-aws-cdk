output "s3_bucket_name" {
  value = aws_s3_bucket.test_bucket.id
}

output "rds_endpoint" {
  value = module.rds_postgres.db_instance_endpoint
}

output "lambda_arn" {
  value = aws_lambda_function.compress.arn
}
