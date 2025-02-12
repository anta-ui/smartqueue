import { useState, useEffect, useCallback } from "react";

interface CacheOptions<T> {
  key: string;
  fetchData: () => Promise<T>;
  maxAge?: number; // en millisecondes
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useCache<T>({
  key,
  fetchData,
  maxAge = 5 * 60 * 1000, // 5 minutes par défaut
  staleWhileRevalidate = true,
}: CacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async (force = false) => {
    const cached = cache.get(key);
    const now = Date.now();

    // Si les données sont en cache et ne sont pas expirées
    if (!force && cached && now - cached.timestamp < maxAge) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Si les données sont en cache mais expirées et qu'on veut les utiliser pendant la revalidation
    if (staleWhileRevalidate && cached) {
      setData(cached.data);
    }

    try {
      setLoading(true);
      const freshData = await fetchData();
      cache.set(key, { data: freshData, timestamp: now });
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      // Si on a des données en cache, on les garde même si elles sont expirées
      if (cached) {
        setData(cached.data);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetchData, maxAge, staleWhileRevalidate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = () => loadData(true);

  return { data, loading, error, refresh };
}

// Utilitaires pour la gestion du cache
export const cacheUtils = {
  clear: () => cache.clear(),
  
  remove: (key: string) => cache.delete(key),
  
  set: <T>(key: string, data: T) => {
    cache.set(key, { data, timestamp: Date.now() });
  },
  
  get: <T>(key: string): T | null => {
    const entry = cache.get(key);
    return entry ? entry.data : null;
  },
  
  // Précharger des données
  preload: async <T>({
    key,
    fetchData,
    maxAge = 5 * 60 * 1000,
  }: CacheOptions<T>) => {
    try {
      const data = await fetchData();
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Failed to preload cache for key: ${key}`, error);
      return null;
    }
  },
  
  // Vérifier si une entrée est expirée
  isExpired: (key: string, maxAge: number): boolean => {
    const entry = cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > maxAge;
  },
  
  // Nettoyer les entrées expirées
  cleanup: (maxAge: number) => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        cache.delete(key);
      }
    }
  },
};
