# Newsletter Generation
This document describes the functionality of the Newsletter Generation components. 

## Functionality
The newsletter generation functionality enables automated HTML & Plaintext newsletter emails containing article summarizations and links to the articles. A newsletter can be made of one or more feed subscriptions and a provided date range to include. This means that if a user subscribes to 2 feed and provides a 5 day range, the newsletter will contain article summarizations for both feeds for articles ingested in the last five days.

Currently, the UI for the HTML newsletter is quite simplistic, but future dev will introduce high-quality styling with thematic options for customization. 

## Technical Architecture and Design
The functionality is enabled by leveraging AWS serverless services including AWS Lambda, Amazon DynamoDB, & Amazon S3.

To generate a newsletter, the `email-generator` Lambda function accepts an array of subscriptionIds and number of days to include. The function will query dynamodb for each subscriptionId for articles within the date range. It then renders both HTML & Plaintext versions of the newsletter using `react-email-generator` (passing the article data to the template). Once the HTML & Plain text newsletters are created, each one is uploaded to S3 under the path `NEWSLETTER/YYYY/MM/DD/UUID.{txt|html}`.

## Generating a newsletter
To generate a newsletter, first ensure you've setup a subscription to the feed you'd like to ingest. See [feed-ingestion.md](feed-ingestion.md) to learn how to subscribe to a feed. 

Once you're subscribed to a feed and articles are ingested, note the `subscriptionId` for the feed. If you need to locate the `subscriptionId`, navigate to DynamoDB and locate the `NewsSubscriptionDate`. This table contains the feeds and articles. To filter just to feeds, **query** the table usiong the `type-index` and set `type` = `subscription`. You can apply additional filters to be applied after query such as `enabled` = `true|false` or `url` = your feed URL. 

Now that you have the `subscriptionId`, navigate to Lambda and locate the `email-generator` Lambda Function. Execute the Lambda with the following input payload:
```json
{
    "numberOfDaysToInclude": 5,
    "subscriptionIds": ["b2fb7bbc-97c2-4a4e-bfa5-f0a639036b26","d85cf7b7-dbdb-4412-824c-9733b0a53a30"]
}
```
Replace the `numberOfDaysToInclude` with the number of days you want to go back for articles. Replace the `subscriptionIds` with an array of one or more `subscriptionId` values.

Once you execute the lambda with the correct payload, it will retrieve the articles for the subscriptions, generate the emails and upload the content to S3.