// src/hooks/organizations/useMembers.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Member {
  id: string;
  email: string;
  user_type: string;
  name?: string;
}

interface UseMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (email: string, userType: string) => Promise<boolean>;
  removeMember: (email: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useMembers = (): UseMembersReturn => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/members/');
      setMembers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (email: string, userType: string): Promise<boolean> => {
    try {
      await api.post('/organization/members/add/', { email, user_type: userType });
      await fetchMembers();
      return true;
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Erreur lors de l\'ajout du membre');
      return false;
    }
  };

  const removeMember = async (email: string): Promise<boolean> => {
    try {
      await api.post('/organization/members/remove/', { email });
      await fetchMembers();
      return true;
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors de la suppression du membre');
      return false;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    refresh: fetchMembers
  };
};