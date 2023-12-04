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