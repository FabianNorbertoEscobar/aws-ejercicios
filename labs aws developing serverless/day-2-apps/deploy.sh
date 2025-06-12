#!/bin/bash
ARTIFACT_BUCKET=$(cat bucket-name.txt)

aws cloudformation package --template-file error-processor/template.yml --s3-bucket $ARTIFACT_BUCKET --output-template-file error-processor/ep-out.yml
aws cloudformation package --template-file serverless-api/template.yml --s3-bucket $ARTIFACT_BUCKET --output-template-file serverless-api/sl-out.yml

aws cloudformation deploy --template-file error-processor/ep-out.yml --stack-name error-processor --capabilities CAPABILITY_NAMED_IAM
aws cloudformation deploy --template-file serverless-api/sl-out.yml --stack-name serverless-api --capabilities CAPABILITY_NAMED_IAM

