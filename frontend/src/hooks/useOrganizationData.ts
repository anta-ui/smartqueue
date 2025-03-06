// src/hooks/useOrganizationData.ts
import { useState, useEffect } from 'react';
import { organizationService } from '@/services/api/organizationService';

export function useOrganizationData<T>(
  id: string, 
  fetchMethod: (id: string) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchMethod(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fetchMethod]);

  return { data, loading, error };
}