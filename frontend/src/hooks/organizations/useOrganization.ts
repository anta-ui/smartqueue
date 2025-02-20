// src/hooks/organizations/useOrganization.ts
import { useState, useEffect } from 'react';
import api from '@/services/api';
import  {Organization}  from './useOrganizations';

interface UseOrganizationReturn {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOrganization(id: string): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await api.get(`/organization/${id}`);
      setOrganization(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError('Erreur lors du chargement de l\'organisation');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  return {
    organization,
    loading,
    error,
    refresh: fetchOrganization
  };
}