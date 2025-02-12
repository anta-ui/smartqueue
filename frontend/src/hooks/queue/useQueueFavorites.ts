"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Queue } from "@/types/queue";

interface QueueFavorite {
  id: string;
  name: string;
  organization: string;
  addedAt: number;
  lastVisit: number;
  visitCount: number;
}

interface UseQueueFavoritesReturn {
  favorites: QueueFavorite[];
  addToFavorites: (queue: Queue) => void;
  removeFromFavorites: (queueId: string) => void;
  isFavorite: (queueId: string) => boolean;
  updateFavoriteStats: (queueId: string) => void;
  getMostVisited: (limit?: number) => QueueFavorite[];
}

export function useQueueFavorites(): UseQueueFavoritesReturn {
  const [favorites, setFavorites] = useLocalStorage<QueueFavorite[]>("queue_favorites", []);

  const addToFavorites = (queue: Queue) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === queue.id)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: queue.id,
          name: queue.name,
          organization: queue.organization.name,
          addedAt: Date.now(),
          lastVisit: Date.now(),
          visitCount: 1,
        },
      ];
    });
  };

  const removeFromFavorites = (queueId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== queueId));
  };

  const isFavorite = (queueId: string) => {
    return favorites.some((fav) => fav.id === queueId);
  };

  const updateFavoriteStats = (queueId: string) => {
    setFavorites((prev) => {
      const index = prev.findIndex((fav) => fav.id === queueId);
      if (index === -1) return prev;

      const newFavorites = [...prev];
      newFavorites[index] = {
        ...newFavorites[index],
        lastVisit: Date.now(),
        visitCount: newFavorites[index].visitCount + 1,
      };

      return newFavorites;
    });
  };

  const getMostVisited = (limit = 5) => {
    return [...favorites]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, limit);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    updateFavoriteStats,
    getMostVisited,
  };
}
