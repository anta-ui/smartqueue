export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  slug: string;
  tags: string[];
  lastUpdated: string;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
}

export interface SearchResult {
  articles: HelpArticle[];
  totalResults: number;
  searchTime: number;
}
