// src/hooks/useOrganizations.ts
import { useState, useEffect } from 'react';
import { organizationService } from '@/services/api/organizationService';

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  plan: 'free' | 'basic' | 'premium';
  region: 'north' | 'south' | 'east' | 'west' | 'central';
  createdAt?: string;
  memberCount?: number;
}
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      setOrganizations(data);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des organisations:', err);
      setError(err.message || 'Impossible de charger les organisations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      await organizationService.delete(orgId);
      // Mettre à jour la liste locale des organisations
      setOrganizations(orgs => orgs.filter(org => org.id !== orgId));
    } catch (err: any) {
      const errorMsg = err instanceof Error
        ? err.message
        : 'Impossible de supprimer l\'organisation';
      throw new Error(errorMsg);
    }
  };

  const refresh = () => {
    return fetchOrganizations();
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refresh,
    deleteOrganization
  };
}