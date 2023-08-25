## PL-CHAIN-consortium-through-Blockchain

This is a the backend project of pl-chain-consortium used by pl-chain-app. 

The app contains the service API to manage:
- customer
- integration with stripe payment
- integration with the blockchain solutions https://www.pl-chain.com owned by angelo.panichella@gmail.com

The app demonstrates how can we use the blockchain to create a consortium.

You can see the backend API on <a href="https://api-consortium.pl-chain.com/v1/api-docs/" target="_blank">pl-chain consortium API</a>.

## What is pl-chain-consortium?

[Contentful](https://www.contentful.com) provides a content infrastructure for digital teams to power content in websites, apps, and devices. Unlike a CMS, Contentful was built to integrate with the modern software stack. It offers a central hub for structured content, powerful management and delivery APIs, and a customizable web app that enable developers and content creators to ship digital products faster.

## Requirements

* Git
* Node 16
* Express.js
* AWS Lambda
* AWS DynamoDB
* AWS Secrets Manager
* AWS IAM Role
* AWS Route53

## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/head-radio/pl-chain-consortium-be.git
cd pl-chain-consortium-be
```

```bash
npm install
```

## Steps for run locally

To start the express server, with the automatic creation of swagger documentation, run the following

```bash
npm run swagger-autogen
```

Open [http://localhost:3000/v1/api-docs/](http://localhost:3000/v1/api-docs/) and take a look around.

You need to configure your locally DynamoDB following the **Official Documentation** [https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

## Local configuration

Open `.env` and inject your local environment variables

```
NODE_ENV=local
PORT=<PORT>
JWT_SECRET=<JWT_SECRET>
SERVICE=<SERVICE>
EMAIL_USER=<EMAIL_USER>
EMAIL_PASS=<EMAIL_PASS>
HOST=<HOST>
EMAIL_PORT=<EMAIL_PORT>
REMOTE_HOST_BE_API=<REMOTE_HOST_BE_API>
REMOTE_HOST_BE_API_DEV=<REMOTE_HOST_BE_API_DEV>
PL_CHAIN_BACKEND_CONTEXT_PATH=<PL_CHAIN_BACKEND_CONTEXT_PATH>
REGION=<REGION>
DYNAMO_DB_ENDPOINT=<DYNAMO_DB_ENDPOINT>
STRIPE_SECRET_KEY=<STRIPE_SECRET_KEY>
```

## Deploy to AWS Lambda
You can also deploy this app to **AWS Lambda** with **Serverless framework**:

Assuming the following function configuration in `serverless.yml`:

```yaml
service: pl-chain-consortium-be

provider:
  name: aws
  runtime: nodejs16.x
  stage: dev
  region: eu-south-1
  memorySize: 128
  timeout: 28

functions:
  app:
    handler: app/app.handler
    environment: ${file(env.development.json)}
    timeout: 28
    events:
      - http:
          path: /
          method: ANY
          cors: true
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

You need also configure your env variables contained in **env.development.json** file. In this file there is also the point to the secrets where are configured different variables used by the application (all these variable are present all in one file .env when you run the application locally).

# Secrets configuration

The **AWS CLI** command to create secret is

aws secretsmanager create-secret --name prod/pl-chain-consortium/secrets --secret-string file://secrets.json

The content of secrets.json file is

```json
{
    "JWT_SECRET": "<JWT_SECRET>",
    "EMAIL_USER": "<EMAIL_USER>",
    "EMAIL_PASS": "<EMAIL_PASS>",
    "ACCESS_KEY_ID": "<ACCESS_KEY_ID>",
    "SECRET_ACCESS_KEY": "<SECRET_ACCESS_KEY>",
    "STRIPE_SECRET_KEY": "<STRIPE_SECRET_KEY>"
}
```

## CI/CD Pipeline
The pipeline has to be upgrated.

Meanwhile you can run the script pipeline.sh to faster the deployment.

```bash
sh build/pipeline.sh
```
