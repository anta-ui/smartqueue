"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { helpService } from "@/services/help";
import type { HelpCategory, HelpArticle } from "@/types/help";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function HelpCenterPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<HelpArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, articlesData] = await Promise.all([
        helpService.getCategories(),
        helpService.getArticles(),
      ]);
      setCategories(categoriesData);
      setPopularArticles(articlesData.slice(0, 5));
      
      // Précharger les articles populaires pour une navigation plus rapide
      helpService.preloadPopularArticles();
    } catch (error) {
      console.error("Failed to load help center data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const { articles } = await helpService.searchArticles(searchQuery);
      setSearchResults(articles);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How can we help you?
        </h1>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {searchQuery ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results
          </h2>
          {searching ? (
            <div className="text-center py-8">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4">
              {searchResults.map((article) => (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/help/category/${category.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <i className={`${category.icon} text-indigo-600 text-2xl`}></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Popular Articles
            </h2>
            <div className="grid gap-4">
              {popularArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/help/article/${article.slug}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {article.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {article.content.substring(0, 150)}...
                        </p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
