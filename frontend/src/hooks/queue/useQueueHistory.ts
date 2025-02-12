"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Queue } from "@/types/queue";

interface QueueHistoryItem {
  id: string;
  name: string;
  organization: string;
  timestamp: number;
  qrCode?: string;
}

interface UseQueueHistoryReturn {
  history: QueueHistoryItem[];
  addToHistory: (queue: Queue, qrCode?: string) => void;
  removeFromHistory: (queueId: string) => void;
  clearHistory: () => void;
  getQueueFromHistory: (queueId: string) => QueueHistoryItem | undefined;
}

export function useQueueHistory(): UseQueueHistoryReturn {
  const [history, setHistory] = useLocalStorage<QueueHistoryItem[]>("queue_history", []);

  const addToHistory = (queue: Queue, qrCode?: string) => {
    setHistory((prev) => {
      // Supprimer l'entrée existante si elle existe
      const filtered = prev.filter((item) => item.id !== queue.id);
      
      // Ajouter la nouvelle entrée au début
      return [
        {
          id: queue.id,
          name: queue.name,
          organization: queue.organization.name,
          timestamp: Date.now(),
          qrCode,
        },
        ...filtered,
      ].slice(0, 10); // Garder seulement les 10 dernières entrées
    });
  };

  const removeFromHistory = (queueId: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== queueId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getQueueFromHistory = (queueId: string) => {
    return history.find((item) => item.id === queueId);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getQueueFromHistory,
  };
}
