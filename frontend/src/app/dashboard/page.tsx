"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/axios';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalQueues: number;
  activeQueues: number;
  totalTickets: number;
  averageWaitTime: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction de récupération des stats
    const fetchDashboardStats = async () => {
      // Vérification côté client du token
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;

      console.log('Token présent :', !!token);

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get('/dashboard/stats/');
        
        console.log('Réponse des stats :', response.data);
        setStats(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Erreur de récupération des stats :', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        // Gestion des erreurs d'authentification
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
        } else {
          setError('Impossible de charger les statistiques');
        }
        
        setLoading(false);
      }
    };

    // Ne lancer la requête que si authentifié
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, router]);

  // Gestion des états de chargement et d'erreur
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Authentification en cours...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Files d'attente totales</h3>
          <p className="mt-2 text-3xl font-semibold">{stats?.totalQueues || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Files d'attente actives</h3>
          <p className="mt-2 text-3xl font-semibold">{stats?.activeQueues || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Tickets totaux</h3>
          <p className="mt-2 text-3xl font-semibold">{stats?.totalTickets || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Temps d'attente moyen</h3>
          <p className="mt-2 text-3xl font-semibold">{stats?.averageWaitTime || 0} min</p>
        </Card>
      </div>
    </div>
  );
}