// src/hooks/organizations/useUsageStats.js
import { useState, useEffect } from 'react';
import { usageApi } from '@/services/api/usageApi';

export const useUsageStats = (organizationId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await usageApi.getStats(organizationId);
      setStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [organizationId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};