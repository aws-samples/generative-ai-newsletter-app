
### A Newsletter Record
```json
{
  "newsletterId": {
    "S": "4b496f63-fa79-40e9-afcb-d9168de4c7ed"
  },
  "compoundSortKey": {
    "S": "newsletter"
  },
  "numberOfDaysToInclude": {
    "N": "5"
  },
  "subscriptions": {
    "L": [
      {
        "S": "5b443dd8-084c-407b-8132-86855ad563cb"
      }
    ]
  }
}
```
*Data Note: `subscriptions` is a list of one or more `subscriptionId` values that can be found in the `NewsSubscriptionData` dynamodb table*

*Future Improvement: `themeId` will eventually be implemented to pull the specific themed styling for the email generation.*

### A Newsletter Subscriber Record
```json
{
  "newsletterId": {
    "S": "4b496f63-fa79-40e9-afcb-d9168de4c7ed"
  },
  "compoundSortKey": {
    "S": "subscriber#c65f1b0d-e91f-4403-a08c-300b6c7e5eb2"
  }
}
```
*Data Note: UUID of subscriber is the `sub` attribute from Cognito User Pool*

### A Newsletter Email Record
```json
{
  "newsletterId": {
    "S": "4b496f63-fa79-40e9-afcb-d9168de4c7ed"
  },
  "compoundSortKey": {
    "S": "email#b11a6fe8-84c6-46f8-842d-0812af22ea17"
  },
  "createdAt": {
    "S": "2023-12-21 18:21:55 "
  }
}
```
*Data Note: Email content is in s3 with key derived from the `createdAt` date and the emails UUID. The S3 Path looks like `s3://[bucketname]/NEWSLETTER/2023/12/21/b11a6fe8-84c6-46f8-842d-0812af22ea17.{html|txt}`*