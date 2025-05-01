// src/hooks/organizations/useOrganizationStats.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Stats {
  activeOrgs: number;
  totalMembers: number;
  avgUsage: number;
  [key: string]: any;
}

interface UseOrganizationStatsReturn {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOrganizationStats = (): UseOrganizationStatsReturn => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats/');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};