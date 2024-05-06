---
layout: doc
title: Post Deployment Guide
---

# Post Deployment Guide
Follow these steps after completing deployment to manage users and logging in as a user for the first time. 

## Creating Users

User accounts for the application are managed using [Amazon Cognito](https://aws.amazon.com/cognito/).

1. Navigate to the Amazon Cognito in the AWS Console and select the User Pool deployed with the solution. Alternatively, you can navigate directly to the user pool by navigating to the `UserPoolLink` provided in the CDK output/CloudFormation output. 
1. In the **Users** box, click the **Create user** button.
1. Complete the user information form. 
	It is recommended to select "Send an email invitation".
	The Email address is required. 
1. Once the form is complete, click the **Create user** button.

## First Time Login

1. Navigate to the `AppLink` URL provided in the CDK or CloudFormation output. This is the main URL for the application. 
1. Login with the email and temporary password.
1. If login is successful, you will be asked to provide your name and update your password.
1. After you complete the name and password update, you will be logged into the application and can get started.