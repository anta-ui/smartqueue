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
  const [organizations, setOrganizations] = useState<Organization[]>([]);  // Initialiser avec un tableau vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/members/');
      setOrganizations(Array.isArray(response.data) ? response.data : []);  // S'assurer que c'est un tableau
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Erreur lors du chargement des organisations');
      setOrganizations([]); // Réinitialiser à un tableau vide en cas d'erreur
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