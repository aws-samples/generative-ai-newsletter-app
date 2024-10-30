import { ArticleSummaryType } from '../api';
import { type MultiSizeFormattedResponse, type ArticleData } from '../prompts';

interface NewsletterJSONProps {
  articles: ArticleData[];
  newsletterId: string;
  title: string;
  newsletterSummary: MultiSizeFormattedResponse;
  articleSummaryType: ArticleSummaryType;
}

export interface NewsletterJSONData {
  newsletterId: string;
  title: string;
  newsletterSummary: string;
  articles: Array<{
    title: string;
    url: string;
    content: string;
    flagLink: string | null;
    createdAt: string;
  }>;
}

export const generateNewsletterJSON = (props: NewsletterJSONProps): string => {
  const {
    newsletterId,
    title,
    newsletterSummary,
    articles,
    articleSummaryType,
  } = props;
  const newsletterJSONData: NewsletterJSONData = {
    newsletterId,
    title,
    newsletterSummary:
      newsletterSummary.longSummary.response ??
      'Error with Newsletter Summary!',
    articles: articles.map((article) => {
      let content;
      if (articleSummaryType === ArticleSummaryType.KEYWORDS) {
        content = article.content.keywords.response;
      } else if (articleSummaryType === ArticleSummaryType.SHORT_SUMMARY) {
        content = article.content.shortSummary.response;
      } else {
        content = article.content.longSummary.response;
      }
      return {
        title: article.title,
        url: article.url,
        content: content ?? 'ERROR',
        flagLink: article.flagLink ?? null,
        createdAt: article.createdAt,
      };
    }),
  };
  return JSON.stringify(newsletterJSONData);
};
