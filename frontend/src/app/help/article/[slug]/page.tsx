"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { helpService } from "@/services/help";
import type { HelpArticle } from "@/types/help";
import {
  ChevronLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClockIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [params.slug]);

  const loadArticle = async () => {
    try {
      // Utiliser la version mise en cache si disponible
      const article = await helpService.getCachedArticle(params.slug as string);
      setArticle(article);

      // Charger les articles liés
      if (article.relatedArticles.length > 0) {
        const related = await Promise.all(
          article.relatedArticles.map((slug) =>
            helpService.getCachedArticle(slug)
          )
        );
        setRelatedArticles(related);
      }
    } catch (error) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!article || feedbackSubmitted) return;

    try {
      await helpService.submitArticleFeedback(article.id, helpful);
      setFeedbackSubmitted(true);
      // Mettre à jour l'article localement
      setArticle((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          helpful: helpful ? prev.helpful + 1 : prev.helpful,
          notHelpful: helpful ? prev.notHelpful : prev.notHelpful + 1,
        };
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error || "Article not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Back
      </button>

      <article className="prose prose-indigo max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {format(new Date(article.lastUpdated), "MMM d, yyyy")}
          </div>
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            {article.tags.join(", ")}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        <div className="border-t pt-8">
          <p className="text-gray-600 mb-4">Was this article helpful?</p>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => handleFeedback(true)}
              disabled={feedbackSubmitted}
              className={feedbackSubmitted ? "opacity-50" : ""}
            >
              <HandThumbUpIcon className="h-5 w-5 mr-2" />
              Yes ({article.helpful})
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleFeedback(false)}
              disabled={feedbackSubmitted}
              className={feedbackSubmitted ? "opacity-50" : ""}
            >
              <HandThumbDownIcon className="h-5 w-5 mr-2" />
              No ({article.notHelpful})
            </Button>
          </div>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Related Articles
          </h2>
          <div className="grid gap-4">
            {relatedArticles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/help/article/${article.slug}`)}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {article.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
