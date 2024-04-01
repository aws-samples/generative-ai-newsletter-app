/* eslint-disable */
import {
  ReadActionStatement,
  ListActionStatement,
  CreateActionStatement,
  UpdateActionStatement
} from './permission-map'
export abstract class ResolverPermissionMapBase {
  abstract canManageDataFeed: ReadActionStatement | ListActionStatement
  abstract canManageNewsletter: ReadActionStatement | ListActionStatement
  abstract getDataFeed: ReadActionStatement | ListActionStatement
  abstract getNewsletter: ReadActionStatement | ListActionStatement
  abstract getNewsletterSubscriberStats:
    | ReadActionStatement
    | ListActionStatement
  abstract getPublication: ReadActionStatement | ListActionStatement
  abstract getUserSubscriptionStatus: ReadActionStatement | ListActionStatement
  abstract listArticles: ReadActionStatement | ListActionStatement
  abstract listDataFeeds: ReadActionStatement | ListActionStatement
  abstract listNewsletters: ReadActionStatement | ListActionStatement
  abstract listPublications: ReadActionStatement | ListActionStatement
  abstract listUserSubscriptions: ReadActionStatement | ListActionStatement
  abstract createDataFeed: CreateActionStatement | UpdateActionStatement
  abstract createNewsletter: CreateActionStatement | UpdateActionStatement
  abstract externalUnsubscribeFromNewsletter:
    | CreateActionStatement
    | UpdateActionStatement
  abstract flagArticle: CreateActionStatement | UpdateActionStatement
  abstract subscribeToNewsletter: CreateActionStatement | UpdateActionStatement
  abstract unsubscribeFromNewsletter:
    | CreateActionStatement
    | UpdateActionStatement
  abstract updateDataFeed: CreateActionStatement | UpdateActionStatement
  abstract updateNewsletter: CreateActionStatement | UpdateActionStatement
  getResolverPermission = (
    resolverName: string
  ): ReadActionStatement | UpdateActionStatement | CreateActionStatement => {
    switch (resolverName) {
      case 'canManageDataFeed':
        return this.canManageDataFeed
      case 'canManageNewsletter':
        return this.canManageNewsletter
      case 'getDataFeed':
        return this.getDataFeed
      case 'getNewsletter':
        return this.getNewsletter
      case 'getNewsletterSubscriberStats':
        return this.getNewsletterSubscriberStats
      case 'getPublication':
        return this.getPublication
      case 'getUserSubscriptionStatus':
        return this.getUserSubscriptionStatus
      case 'listArticles':
        return this.listArticles
      case 'listDataFeeds':
        return this.listDataFeeds
      case 'listNewsletters':
        return this.listNewsletters
      case 'listPublications':
        return this.listPublications
      case 'listUserSubscriptions':
        return this.listUserSubscriptions
      case 'createDataFeed':
        return this.createDataFeed
      case 'createNewsletter':
        return this.createNewsletter
      case 'externalUnsubscribeFromNewsletter':
        return this.externalUnsubscribeFromNewsletter
      case 'flagArticle':
        return this.flagArticle
      case 'subscribeToNewsletter':
        return this.subscribeToNewsletter
      case 'unsubscribeFromNewsletter':
        return this.unsubscribeFromNewsletter
      case 'updateDataFeed':
        return this.updateDataFeed
      case 'updateNewsletter':
        return this.updateNewsletter
      default:
        throw new Error('Resolver Permission not found for ' + resolverName)
    }
  }
}
