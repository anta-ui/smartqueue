// src/hooks/organizations/useOrganizations.ts
import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  memberCount?: number;
  plan?: string;
  region?: string;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      // Changez cette URL pour utiliser /api/organizations/ au lieu de /api/organization/members/
      const response = await api.get('/organizations/');
      setOrganizations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Erreur lors du chargement des organisations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refresh: fetchOrganizations
  };
}