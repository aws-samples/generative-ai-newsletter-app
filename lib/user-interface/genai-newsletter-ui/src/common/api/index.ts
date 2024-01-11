import { AppConfig } from '../types';
import { NewsFeedsClient } from './news-feeds-client';
import { NewslettersClient } from './newsletters-client'

export class ApiClient {
    private _newslettersClient: NewslettersClient | undefined;
    private _newsFeedsClient: NewsFeedsClient | undefined;

    public get newsletters() {
        if(!this._newslettersClient){
            this._newslettersClient = new NewslettersClient()
        }
        return this._newslettersClient
    }

    public get newsFeeds() {
        if(!this._newsFeedsClient){
            this._newsFeedsClient = new NewsFeedsClient()
        }
        return this._newsFeedsClient

    }

    constructor(protected _appConfig: AppConfig){}
}