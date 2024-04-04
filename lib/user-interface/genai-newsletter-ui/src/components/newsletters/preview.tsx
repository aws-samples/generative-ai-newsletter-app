/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { ArticleSummaryType } from '../../../../../shared/api'
import { NewsletterEmailProps } from '../../../../../shared/common'
import { ArticleData, MultiSizeFormattedResponse } from '../../../../../shared/prompts'
import NewsletterEmail from '../../../../../shared/email-generator/emails/newsletter'
import { AppContext } from '../../common/app-context'
import { useContext } from 'react'

export default function NewsletterPreview(props?: NewsletterEmailProps) {
  const appContext = useContext(AppContext)
  const longSummary =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In fermentum et sollicitudin ac orci. Tristique sollicitudin nibh sit amet commodo nulla facilisi. Morbi tempus iaculis urna id volutpat lacus laoreet non. Diam maecenas ultricies mi eget mauris pharetra et. Pellentesque elit eget gravida cum. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Tincidunt eget nullam non nisi est sit. Cursus vitae congue mauris rhoncus aenean vel. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Lorem donec massa sapien faucibus et molestie.' +
    ' ' +
    'At tempor commodo ullamcorper a lacus vestibulum sed arcu non. Mauris pellentesque pulvinar pellentesque habitant. Elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Egestas pretium aenean pharetra magna. Elit at imperdiet dui accumsan sit amet nulla facilisi morbi. Ac turpis egestas maecenas pharetra convallis. Lorem ipsum dolor sit amet consectetur adipiscing. Lacinia quis vel eros donec ac odio. Urna condimentum mattis pellentesque id nibh tortor. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget.'
  const shortSummary =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  const sampleNewsletterSummary = new MultiSizeFormattedResponse({
    keywords: 'Apple, Pear, Pineapple',
    longSummary,
    shortSummary
  })
  const sampleArticles: ArticleData[] = [
    {
      content: new MultiSizeFormattedResponse({
        keywords: 'Alpha, Bravo, Charlie',
        longSummary,
        shortSummary
      }),
      createdAt: Date.now().toString(),
      title: 'Sample Article One',
      url: 'XXXXX',
      flagLink: 'YHGDFSFSCCF'
    },
    {
      content: new MultiSizeFormattedResponse({
        keywords: 'Cow, Goat, Moose',
        longSummary,
        shortSummary
      }),
      createdAt: Date.now().toString(),
      title: 'Sample Article Two',
      url: 'YYYYY',
      flagLink: 'YHGDFSFSCCF'
    }
  ]
  return (
    <NewsletterEmail
      articleSummaryType={
        props?.articleSummaryType ?? ArticleSummaryType.SHORT_SUMMARY
      }
      newsletterId={props?.newsletterId ?? 'XXXX'}
      articles={props?.articles ?? sampleArticles}
      newsletterSummary={props?.newsletterSummary ?? sampleNewsletterSummary}
      appHostName={appContext?.ui?.hostName ?? '/'}
      title={props?.title ?? 'Sample Newsletter Title'}
      previewMode={true}
      styleProps={props?.styleProps}
    />
  )
}
