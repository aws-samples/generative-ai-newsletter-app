### A Newsletter Record

```json
{
  "newsletterId": {
    "S": "5ee8ed47-50d9-4dd6-be24-15b184f4cc40"
  },
  "compoundSortKey": {
    "S": "newsletter#5ee8ed47-50d9-4dd6-be24-15b184f4cc40"
  },
  "newsletterTitle": {
    "S": "GenAI AWS Newsletter"
  },
  "numberOfDaysToInclude": {
    "N": "5"
  },
  "scheduleId": {
    "S": "7657dbaa-7efd-4ff4-b726-fd73ed6058ff"
  },
  "subscriptionIds": {
    "L": [
      {
        "S": "d7cbcc1e-4890-4469-82ea-38ce933bf220"
      }
    ]
  }
}
```

_Data Note: `subscriptions` is a list of one or more `subscriptionId` values that can be found in the `NewsSubscriptionData` dynamodb table_

_Future Improvement: `themeId` will eventually be implemented to pull the specific themed styling for the email generation._

### A Newsletter Subscriber Record

```json
{
  "newsletterId": {
    "S": "5ee8ed47-50d9-4dd6-be24-15b184f4cc40"
  },
  "compoundSortKey": {
    "S": "subscriber#1f4746cf-cb27-41c3-ba0e-18028d7a5449"
  }
}
```

_Data Note: UUID of subscriber is the `sub` attribute from Cognito User Pool_

### A Newsletter Email Record

```json
{
  "newsletterId": {
    "S": "5ee8ed47-50d9-4dd6-be24-15b184f4cc40"
  },
  "compoundSortKey": {
    "S": "email#c53bf253-10c1-469c-9027-ea1c501e21a7"
  },
  "campaignId": {
    "S": "ebefe8731c754db29555a9588398c795"
  },
  "createdAt": {
    "S": "2023-12-28"
  }
}
```

_Data Note: Email content is in s3 with key derived from the `createdAt` date and the emails UUID. The S3 Path looks like `s3://[bucketname]/NEWSLETTERS/2023/12/21/b11a6fe8-84c6-46f8-842d-0812af22ea17.{html|txt}`_
