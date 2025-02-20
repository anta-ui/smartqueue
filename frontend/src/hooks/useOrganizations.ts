// src/hooks/useOrganizations.ts
import { useState, useEffect } from "react";
import { api } from "@/services/api";

export interface Organization {
  id: string;
  name: string;
  status: "active" | "inactive" | "suspended";
  memberCount?: number;
  plan?: string;
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/organization/members/");
      setOrganizations(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des organisations:", err);
      setError("Impossible de charger les organisations");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (organizationId: string, email: string, userType: string) => {
    try {
      await api.post(`/organization/members/add/`, {
        email,
        user_type: userType,
      });
      await fetchOrganizations(); // Rafraîchir la liste
      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout du membre:", err);
      throw err;
    }
  };

  const removeMember = async (organizationId: string, email: string) => {
    try {
      await api.post(`/organization/members/remove/`, {
        email,
      });
      await fetchOrganizations(); // Rafraîchir la liste
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du membre:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    addMember,
    removeMember,
    refresh: fetchOrganizations,
  };
};