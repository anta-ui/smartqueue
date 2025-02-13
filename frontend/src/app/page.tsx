"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/axios';
import { Card } from "@/components/ui/card";

interface DashboardStats {
  totalQueues: number;
  activeQueues: number;
  totalTickets: number;
  averageWaitTime: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/dashboard/stats/');
        setStats(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Erreur de récupération des stats:', error);
        
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

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardStats();
  }, [router]);

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
        {/* Autres cartes similaires */}
      </div>
    </div>
  );
}