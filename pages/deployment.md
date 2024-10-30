# Deploying the Solution

The solution is developed using AWS Cloud Development Kit (CDK), TypeScript, & NodeJS

## Prerequisites
* You will need an [AWS Account](https://repost.aws/knowledge-center/create-and-activate-aws-account).

* Either an [IAM User](https://console.aws.amazon.com/iamv2/home?#/users/create) or [IAM Identity Center User](https://aws.amazon.com/iam/identity-center/) with `AdministratorAccess` policy granted to your user. *Not recommended for a production environment.*
* [AWS CLI](https://aws.amazon.com/cli/) installed and configured to use with your AWS account.
* [NodeJS 20](https://nodejs.org/en/download/) installed
* The `ARN` of your [verified email identity](https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-email-manage-verify.html) that you will send newsletter emails from. You will also be asked to provide an email address that will be the sender, which must be associated with the verified email identity.


## Deployment

1. Clone the repository
	```
	git clone https://github.com/aws-samples/generative-ai-newsletter-app/
	```
1. Change directory into the cloned repository
	```shell
	cd generative-ai-newsletter-app
	```
1. Install the project dependencies
	```shell
	npm install
	```
1. Run the configuration wizard to create a deployment configuration file.
	```shell
	npm run config manage
	```
	The configuration wizard will generate a configuration file in `bin/config.json`. This file will be used during the deployment. Unless you need to change the configuration file, you do not need to run the configuration wizard for future deployments. If you change the **Stack Name**, it will cause a new deployment to occur. 

1. Build and synthesize the code with the newly created configurations
	```shell
	npm run build
	```

1. [*Optional*] Bootstrap AWS CDK on the target AWS Account & Region. 
	> Note: This is required if you have never used AWS CDK on this account and region combination. ([More information on CDK bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/cli.html#cli-bootstrap)).

1. Deploy the solution
	```shell
	npm run deploy
	```
	You can view the progress of your CDK deployment in the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home) in the selected region.

1. Once the deployment is complete, CDK should show outputs that resemble the following. (Note: terms in brackets represents a generated/dynamic value)
	```
	...
	Outputs:
	[stackName].AppLink = https://dxxxxxxxxxxxxx.cloudfront.net/
	[stackName].UserPoolLink = https://[region].console.aws.amazon.com/cognito/v2/idp/user-pools/xxxxx_XXXXX/users?region=[region]
	...
	```	
	If you need these outputs again, you can view the deployment in the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home) by navigating to the deployed stack and visiting the "Outputs" tab.

## Post Deployment Guidance
Once you have completed the deployment, follow the [Post Deployment Guide](./post-deployment).