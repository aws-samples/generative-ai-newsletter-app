/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { AppConfig } from '../types'
import { DataFeedsClient } from './data-feeds-client'
import { NewslettersClient } from './newsletters-client'

export class ApiClient {
  private _newslettersClient: NewslettersClient | undefined
  private _dataFeedsClient: DataFeedsClient | undefined

  public get newsletters() {
    if (!this._newslettersClient) {
      this._newslettersClient = new NewslettersClient()
    }
    return this._newslettersClient
  }

  public get dataFeeds() {
    if (!this._dataFeedsClient) {
      this._dataFeedsClient = new DataFeedsClient()
    }
    return this._dataFeedsClient
  }

  constructor(protected _appConfig: AppConfig) {}
}
