# Newsletter Generation

This document describes the functionality of the Newsletter Generation components.

## Functionality

The newsletter generation functionality enables automated HTML & Plaintext newsletter emails containing article summarizations and links to the articles. A newsletter can be made of one or more feed subscriptions and a provided date range to include. This means that if a user subscribes to 2 feed and provides a 5 day range, the newsletter will contain article summarizations for both feeds for articles ingested in the last five days.

Currently, the UI for the HTML newsletter is quite simplistic, but future dev will introduce high-quality styling with thematic options for customization.

## Technical Architecture and Design

The functionality is enabled by leveraging AWS serverless services including AWS Lambda, Amazon DynamoDB, & Amazon S3.

To generate a newsletter, the `email-generator` Lambda function accepts an array of subscriptionIds and number of days to include. The function will query dynamodb for each subscriptionId for articles within the date range. It then renders both HTML & Plaintext versions of the newsletter using `react-email-generator` (passing the article data to the template). Once the HTML & Plain text newsletters are created, each one is uploaded to S3 under the path `NEWSLETTER/YYYY/MM/DD/UUID.{txt|html}`.

## Generating a newsletter email

To generate a newsletter, first ensure you've setup a subscription to the feed you'd like to ingest. See [feed-ingestion.md](feed-ingestion.md) to learn how to subscribe to a feed.

Once you're subscribed to a feed and articles are ingested, note the `subscriptionId` for the feed. If you need to locate the `subscriptionId`, navigate to DynamoDB and locate the `NewsSubscriptionData`. This table contains the feeds and articles. To filter just to feeds, **query** the table usiong the `type-index` and set `type` = `subscription`. You can apply additional filters to be applied after query such as `enabled` = `true|false` or `url` = your feed URL.

Now that you have the `subscriptionId`, navigate to Lambda and locate the `email-generator` Lambda Function. Execute the Lambda with the following input payload:

```json
{
  "numberOfDaysToInclude": 5,
  "subscriptionIds": [
    "b2fb7bbc-97c2-4a4e-bfa5-f0a639036b26",
    "d85cf7b7-dbdb-4412-824c-9733b0a53a30"
  ]
}
```

Replace the `numberOfDaysToInclude` with the number of days you want to go back for articles. Replace the `subscriptionIds` with an array of one or more `subscriptionId` values.

Once you execute the lambda with the correct payload, it will retrieve the articles for the subscriptions, generate the emails and upload the content to S3.

## Sending a newsletter email to subscribers

Once a newsletter email is created, you can trigger the newsletter to send to subscribers. You will need to note the `newsletterId` and `emailId` from the newsletter email you created.
Navigate to the `newsletter-campaign-creator` Lambda function. Execute the lambda function with the following payload:

```json
{
  "newsletterId": "5ee8ed47-50d9-4dd6-be24-15b184f4cc40",
  "emailId": "c53bf253-10c1-469c-9027-ea1c501e21a7"
}
```

The lambda will create a new **campaign** in Amazon Pinpoint. The name of the campaign will be the `emailId` you provided.
To determine which users should receive the email, the campaign leverages a `CampaignHook` to automate filtering the proper `endpoints` (Pinpoint recipients) that are subscribed to the newsletter. Read more about customizing segments with AWS Lambda [here](https://docs.aws.amazon.com/pinpoint/latest/developerguide/segments-dynamic.html).

The `CampaignHook` is a lambda function defined in the `PinpointApp` cdk construct called `pinpoint-campaign-hook`. Pinpoint will call this hook and pass up to 50 `endpoints` to the lambda function. The lambda function will then compare each `endpointId` and the `campaignId` provided with the subscription data in `NewsletterData` dynamodb table. The lambda will only return the endpoints that are subscribed to the newsletter and filter out any endpoints not subscribed. If more than 50 endpoints exist, Pinpoint will filter the endpoints in batches of 50.

To review the details of the Pinpoint Campaign, naviate to Amazon Pinpoint. From the menu, select **All Projects** and then selected the project named `GenAINewsletter`. The project contains all details, analytics, campaigns, etc. relating to the Gen AI Newsletter.

Navigate to **Campaigns** from the project menu under `GenAINewsletter`. Locate the campaign with the **Campaign name** that matches the `emailId` you provided previously. If there is more then one campaign with the same name, this means the newsletter was triggered to send more than one time (likely manually). If this happens, refer to the campaign **created date** to find the one that corresponds.

Within the campaign you can see the base details of the campaign. Under **campaign deliveries**, you can see the number of endpoints targeted vs processed. To review the **analytics** of the campaign, click the **Campaign metrics** button at the top of the campaign details page.
