/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { type MultiSizeFormattedResponse } from './prompt-processing';

export interface ArticleData {
  title: string;
  url: string;
  content: MultiSizeFormattedResponse;
  createdAt: string;
  flagLink?: string;
}
