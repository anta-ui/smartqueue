"use client";

import { useState, useEffect } from "react";
import { useQueueHistory } from "./useQueueHistory";
import { useQueueFavorites } from "./useQueueFavorites";
import type { Queue } from "@/types/queue";

interface QueueSuggestion {
  queue: Queue;
  score: number;
  reason: string;
}

interface UseQueueSuggestionsReturn {
  suggestions: QueueSuggestion[];
  refreshSuggestions: () => void;
}

export function useQueueSuggestions(): UseQueueSuggestionsReturn {
  const { history } = useQueueHistory();
  const { favorites, getMostVisited } = useQueueFavorites();
  const [suggestions, setSuggestions] = useState<QueueSuggestion[]>([]);

  const calculateSuggestions = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Récupérer les files fréquemment visitées à cette heure
    const hourlyPatterns = history.reduce((acc, item) => {
      const visitHour = new Date(item.timestamp).getHours();
      const visitDay = new Date(item.timestamp).getDay();
      const key = `${item.queueId}-${visitDay}-${visitHour}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyser les temps d'attente moyens
    const waitTimes = history.reduce((acc, item) => {
      if (!acc[item.queueId]) {
        acc[item.queueId] = {
          total: 0,
          count: 0,
          avg: 0,
        };
      }
      acc[item.queueId].total += item.waitTime || 0;
      acc[item.queueId].count += 1;
      acc[item.queueId].avg = acc[item.queueId].total / acc[item.queueId].count;
      return acc;
    }, {} as Record<string, { total: number; count: number; avg: number }>);

    // Générer les suggestions
    const newSuggestions: QueueSuggestion[] = [];

    // 1. Files favorites avec un bon timing
    getMostVisited().forEach((fav) => {
      const hourlyVisits = hourlyPatterns[`${fav.id}-${currentDay}-${currentHour}`] || 0;
      if (hourlyVisits > 0) {
        newSuggestions.push({
          queue: {
            id: fav.id,
            name: fav.name,
            organization: { name: fav.organization },
          } as Queue,
          score: hourlyVisits * 2, // Plus de poids pour les favoris
          reason: "Vous visitez souvent cette file à cette heure",
        });
      }
    });

    // 2. Files avec temps d'attente courts
    Object.entries(waitTimes).forEach(([queueId, stats]) => {
      if (stats.avg < 15 && !newSuggestions.some(s => s.queue.id === queueId)) {
        const historyItem = history.find(h => h.queueId === queueId);
        if (historyItem) {
          newSuggestions.push({
            queue: {
              id: queueId,
              name: historyItem.queueName,
              organization: { name: historyItem.organizationName },
            } as Queue,
            score: (30 - stats.avg) / 30, // Score basé sur le temps d'attente
            reason: `Temps d'attente moyen court : ${Math.round(stats.avg)} minutes`,
          });
        }
      }
    });

    // 3. Files populaires dans votre zone
    const recentPopular = history
      .filter(item => {
        const visitTime = new Date(item.timestamp).getTime();
        const hoursSince = (Date.now() - visitTime) / (1000 * 60 * 60);
        return hoursSince < 24;
      })
      .reduce((acc, item) => {
        acc[item.queueId] = (acc[item.queueId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(recentPopular).forEach(([queueId, visits]) => {
      if (visits >= 3 && !newSuggestions.some(s => s.queue.id === queueId)) {
        const historyItem = history.find(h => h.queueId === queueId);
        if (historyItem) {
          newSuggestions.push({
            queue: {
              id: queueId,
              name: historyItem.queueName,
              organization: { name: historyItem.organizationName },
            } as Queue,
            score: visits / 10,
            reason: "File populaire aujourd'hui",
          });
        }
      }
    });

    // Trier par score et limiter à 5 suggestions
    setSuggestions(
      newSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    );
  };

  useEffect(() => {
    calculateSuggestions();
  }, [history, favorites]);

  return {
    suggestions,
    refreshSuggestions: calculateSuggestions,
  };
}
