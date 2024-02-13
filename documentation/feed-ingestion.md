# Feed Ingestion

This document describes the functionality of Feed Subscription and Ingestion and the underlying components that are used to support the functionality.

## Functionality

The feed subscription & ingestion functionality enables users to subscribe to a remote RSS or ATOM feed.
The user provides the feed URL, which in turn, subscribes the system to the feed.
The system will poll the feed daily to check for new posts.
When the system detects a new post, it will the consume the article, generate a brief article summary, and store the details.

## Technical Architecture and Design

This functionality is enabled by leveraging AWS serverless services including AWS Lambda, AWS Step Functions, Amazon DynamoDB, Amazon S3, & Amazon Bedrock.

To subscribe to a RSS or ATOM feed, the `feed-subscriber` Lambda function accepts a feed URL. The function then makes a request to the URL and reads in the response. The response is validated to confirm it a proper feed, then determines if it a RSS feed or an ATOM feed by parsing the XML for matched formatting. If the URL is valid, the feed data is stored in DynamoDB (effectively subscribing to the URL)

For automating daily checks, the `subscription-poll-step-function` is executed by an EventBridge rule. The step function the executes `get-subscriptions` function which queries the DynamoDB table for subscriptions that are enabled. It then uses the step function Map functionality to concurrently execute the `ingestion-step-function`, one execution per subscriptionId.

The `ingestion-step-function` is a Step Function workflow accepts a `subscriberId` which is the unique ID for the feed subscription, generated when the feed is subscribed to. The step function then gets the subscription details from DynamoDB using the provided `subscriberId`. The step function then executes the `feed-reader` Lambda function to get all posts from the feed. The step function then executes `filter-ingested-articles` which queries the DynamoDB table for all articles with the `subscriberId` and compares the articles with the list from the feed, removing any already ingested articles, then returning the uningested to the step function. Once the array of articles is only new, uningested articles, the step function performs a Map function and executes the `article-ingestor` Lambda concurrently, one for each article that needs ingesting. The function makes a request to the article URL provided, stores the contents of the article, generates an article summary using an API call to Bedrock and finally stores the information in DynamoDB.

## Subscribing to a feed

To subscribe to a RSS or ATOM feed, execute the `feed-subscriber` Lambda function. The input for the lambda should match the following format:

```json
{
  "newsletterId": "f76dce13-d510-49af-a5fb-876f556e7a2f"
}
```

`feed subscriber` will read the feed and store the information in dynamodb as a subscription that is enabled. It will then start an execution of `ingestion-step-function` with the `subscriptionId` that was generated and stored with the feed details. After the initial article ingestion, future ingestion will be in the scheduled daily poll.
To find the `newsletterId`, see [newsletter-generation.md](newsletter-generation.md)

### Disable / Enable Subscription Checks

To disable the system from checking a feed for future updates, locate the feed in the DynamoDB table and change `enabled` to `false`.
To enable the system to check daily for updates, change `enabled` to `true`

To filter the dynamodb table, query the table using the `type-index` and set the partition key `type` = `subscription`. From there, you can apply filters as necessary to fine the subscription.

### Outstanding Efforts

- Improve error handling within lambda and within the step function
