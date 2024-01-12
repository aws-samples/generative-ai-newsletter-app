# Generative AI Powered Newsletters

This goal of this project is to create a sample application that showcases AWS Serverless and GenAI technology to subscribe to news feeds and publications, accurately summarize the data and generate visually appealing newsletters for end-user consumption. 

The project is currently in the initial design phase with a PRFAQ in the works. 

This document will be filled out more as the project evolves. 

### Some High-Level Thoughts for the Project
* Leverage serverless technology as much as possible, avoid provisioned resources like SageMaker endpoints, to reduce cost of running the sample
* Leverage Bedrock for LLM for summarization, text embedding, etc. 
* Aim to provide methods to reduce hallucination and enable the user to validate information. This can be, for example, including links to sources
* Develop a Front-End UI that leverages [Cloudscape](https://cloudscape.design) React framework
* Aim to leverage newer technology that may not have samples, such as Bedrock Agents
* Enable Newsletter subscriptions (users could get an emailed newsletter, a text with a link to a newsletter, a slack notification, etc)

## Deploying the Solution
The following steps will guide you through deploying the CDK Application to your environment.
1. In your project root folder, install package dependencies: `npm install --save-dev`
2. After all packages are installed, you will need to build the solution by running `npm run build`. This will trigger amplify codegen to create the API files from the `schema.graphql` file. If generated files exist, they will simply be regenerated. Once the generation is complete, `tsc` will compile the typescript project.
3. Run the configuration CLI to setup the necessary CDK context file. To run the configuration creation CLI, run `npm run config create`. This will will you through setting up your configuration. If a config exists, you can optionally update values. If you'd like to view the existing config, you can run `npm run config show`
4. Deploy the stack to AWS. `npm run deploy`


### Project Leads
This project is currently lead by Addie Rudy ([awsrudy@](https://phonetool.amazon.com/users/awsrudy)) and Pete Conrad ([peteconr@](https://phonetool.amazon.com/users/peteconr))


### Additional Documentation
To find additional documentation, please visit the `documentation/` directory from the root of the repo. 