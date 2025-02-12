import { api } from "../api";
import type { HelpArticle, HelpCategory, SearchResult } from "@/types/help";

class HelpService {
  // Catégories
  async getCategories(): Promise<HelpCategory[]> {
    const { data } = await api.get<HelpCategory[]>("/help/categories");
    return data;
  }

  async getCategory(slug: string): Promise<HelpCategory> {
    const { data } = await api.get<HelpCategory>(`/help/categories/${slug}`);
    return data;
  }

  // Articles
  async getArticles(categorySlug?: string): Promise<HelpArticle[]> {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append("category", categorySlug);
    }
    const { data } = await api.get<HelpArticle[]>(`/help/articles?${params}`);
    return data;
  }

  async getArticle(slug: string): Promise<HelpArticle> {
    const { data } = await api.get<HelpArticle>(`/help/articles/${slug}`);
    return data;
  }

  async searchArticles(query: string): Promise<SearchResult> {
    const { data } = await api.get<SearchResult>(`/help/search?q=${encodeURIComponent(query)}`);
    return data;
  }

  // Feedback
  async submitArticleFeedback(articleId: string, helpful: boolean): Promise<void> {
    await api.post(`/help/articles/${articleId}/feedback`, { helpful });
  }

  // Cache local pour les articles fréquemment consultés
  private articleCache = new Map<string, { article: HelpArticle; timestamp: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  async getCachedArticle(slug: string): Promise<HelpArticle> {
    const cached = this.articleCache.get(slug);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.article;
    }

    const article = await this.getArticle(slug);
    this.articleCache.set(slug, { article, timestamp: now });
    return article;
  }

  // Préchargement des articles populaires
  async preloadPopularArticles(): Promise<void> {
    const { data } = await api.get<HelpArticle[]>("/help/articles/popular");
    data.forEach(article => {
      this.articleCache.set(article.slug, {
        article,
        timestamp: Date.now()
      });
    });
  }
}

export const helpService = new HelpService();
