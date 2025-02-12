import { useState, useEffect } from 'react';

interface CacheOptions<T> {
  key: string;
  ttl?: number;
  initialData?: T;
}

export function useCache<T>({ key, ttl = 5 * 60 * 1000, initialData }: CacheOptions<T>) {
  const [data, setData] = useState<T | null>(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { value, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return value;
      }
      localStorage.removeItem(key);
    }
    return initialData || null;
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem(
        key,
        JSON.stringify({
          value: data,
          timestamp: Date.now(),
        })
      );
    }
  }, [key, data]);

  const updateCache = (newData: T) => {
    setData(newData);
  };

  const clearCache = () => {
    localStorage.removeItem(key);
    setData(null);
  };

  return {
    data,
    updateCache,
    clearCache,
  };
}
