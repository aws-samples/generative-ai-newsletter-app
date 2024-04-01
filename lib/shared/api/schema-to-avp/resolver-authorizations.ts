import { CreateActionStatement, ReadActionStatement, UpdateActionStatement } from './permission-map'
import { ResolverPermissionMapBase } from './action-authorizor'

/**
 * This class maps resolvers defined in the schema.graphql to AVP permissions
 * The abstract class `ResolverPermissionMapBase` is auto generated.
 * If new queries, mutations or subscriptions are added to the schema,
 * the permissions will be required to be added for compilation
 */
export class ResolverPermissions extends ResolverPermissionMapBase {
  getNewsletter = new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  listNewsletters = new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceType: 'newsletter',
    resourceId: 'newsletterId'
  })

  createDataFeed = new CreateActionStatement({
    actionId: 'createDataFeed',
    resourceType: 'dataFeed'
  })

  createNewsletter = new CreateActionStatement({
    actionId: 'createNewsletter',
    resourceType: 'newsletter'
  })

  getDataFeed = new ReadActionStatement({
    actionId: 'viewDataFeed',
    resourceId: 'dataFeedId',
    resourceType: 'dataFeed'
  })

  listDataFeeds = new ReadActionStatement({
    actionId: 'viewDataFeed',
    resourceType: 'dataFeed',
    resourceId: 'dataFeedId'
  })

  // ListArticles is part of viewDataFeed action
  listArticles = new ReadActionStatement({
    actionId: 'viewArticles',
    resourceId: 'dataFeedId',
    resourceType: 'dataFeed'
  })

  // ListPublications is part of viewNewsletter action
  listPublications = new ReadActionStatement({
    actionId: 'viewPublications',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  // getPublication is part of viewNewsletter action
  getPublication = new ReadActionStatement({
    actionId: 'viewPublications',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  // getNewsletterSubscriberStats is part of manageNewsletter action
  getNewsletterSubscriberStats = new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  getUserNewsletterSubscriptionStatus = new ReadActionStatement({
    actionId: 'manageUserSubscription',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  listUserNewsletterSubscriptions = new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  flagArticle = new CreateActionStatement({
    actionId: 'flagArticle',
    resourceId: 'articleId',
    resourceType: 'article'
  })

  subscribeToNewsletter = new UpdateActionStatement({
    actionId: 'manageUserSubscription',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  }, new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  }))

  unsubscribeFromNewsletter = new ReadActionStatement({
    actionId: 'manageUserSubscription',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  getUserSubscriptionStatus = new ReadActionStatement({
    actionId: 'manageUserSubscription',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  // This one is a key 'view' business logic decision
  // Currently, you can only view subscriptions that you're allowed to view.
  // This limits visibility to Newsletters that were visible and subscribed to, but then set to not visible.
  listUserSubscriptions = new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  updateDataFeed = new UpdateActionStatement({
    actionId: 'updateDataFeed',
    resourceId: 'dataFeedId',
    resourceType: 'dataFeed'
  }, new ReadActionStatement({
    actionId: 'viewDataFeed',
    resourceId: 'dataFeedId',
    resourceType: 'dataFeed'
  }))

  canManageDataFeed = new ReadActionStatement({
    actionId: 'manageDataFeed',
    resourceId: 'dataFeedId',
    resourceType: 'dataFeed'
  })

  canManageNewsletter = new ReadActionStatement({
    actionId: 'manageNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  })

  updateNewsletter = new UpdateActionStatement({
    actionId: 'updateNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  }, new ReadActionStatement({
    actionId: 'viewNewsletter',
    resourceId: 'newsletterId',
    resourceType: 'newsletter'
  }))

  /**
   * There are no authorization checks on this endpoint
   */
  externalUnsubscribeFromNewsletter = new CreateActionStatement({
    actionId: 'N/A',
    resourceType: 'N/A'
  })
}
