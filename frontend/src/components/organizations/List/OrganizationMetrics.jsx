// src/components/organizations/list/OrganizationMetrics.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { organizationService } from '@/services/api/organizationService';

export function OrganizationMetrics() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Dans un environnement réel, vous feriez un appel API ici pour obtenir les métriques
      // Comme c'est un exemple, nous simulons des données de métriques
      const data = await simulateMetricsFetch();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des métriques:', err);
      setError('Impossible de charger les métriques');
    } finally {
      setLoading(false);
    }
  };

  // Simuler un appel API pour récupérer les métriques
  const simulateMetricsFetch = async () => {
    // Dans une application réelle, remplacez ceci par un appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 24,
          active: 18,
          inactive: 5,
          pending: 1,
          newLastMonth: 3,
          growth: 12.5,
          membersAvg: 8.2,
          alerts: 2
        });
      }, 500);
    });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMetrics();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Métriques</CardTitle>
          <CardDescription>Chargement des métriques...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-500 space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur lors du chargement des métriques: {error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-4"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md">Vue d'ensemble des Organisations</CardTitle>
            <CardDescription>Métriques et indicateurs clés</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-gray-500 text-sm">
              <Building className="h-4 w-4 mr-1" />
              <span>Total Organisations</span>
            </div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">{metrics.total}</span>
              {metrics.growth > 0 ? (
                <div className="flex items-center text-green-600 text-xs ml-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.growth}%
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-xs ml-2">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {metrics.growth}%
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-gray-500 text-sm">
              <Activity className="h-4 w-4 mr-1" />
              <span>Statut</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">{metrics.active}</Badge>
              <Badge className="bg-gray-100 text-gray-800">{metrics.inactive}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">{metrics.pending}</Badge>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="text-green-600 mr-1">{metrics.active}</span> actives, 
              <span className="text-gray-600 mx-1">{metrics.inactive}</span> inactives, 
              <span className="text-yellow-600 ml-1">{metrics.pending}</span> en attente
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-gray-500 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>Membres par Org.</span>
            </div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">{metrics.membersAvg}</span>
              <span className="text-sm text-gray-500 ml-1">moyenne</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>Activité Récente</span>
            </div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">{metrics.newLastMonth}</span>
              <span className="text-sm text-gray-500 ml-1">ce mois</span>
            </div>
            {metrics.alerts > 0 && (
              <div className="flex items-center text-amber-600 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {metrics.alerts} org. requièrent attention
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <div className="flex justify-center w-full">
          <Button 
            variant="link" 
            onClick={() => router.push('/dashboard/reports/organizations')}
            className="text-sm"
          >
            Voir tous les rapports et analyses détaillées
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}