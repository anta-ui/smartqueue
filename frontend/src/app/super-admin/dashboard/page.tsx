'use client';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { superAdminService } from '@/services/superAdminService';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ServerIcon,
  CogIcon,
  CurrencyEuroIcon
} from "@heroicons/react/24/outline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  GlobalMetrics, 
  OrganizationLocation, 
  UsageTrend, 
  ServiceHealth,
  SystemAlert,
  SystemLog 
} from '@/types/dashboard';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Données mockées par défaut
const mockDashboardData = {
  globalMetrics: {
    organizations: {
      total: 150,
      active: 120,
      newThisMonth: 10,
      churnRate: 2.5
    },
    revenue: {
      mrr: 50000,
      arr: 600000,
      growth: 15,
      averageRevenue: 3500
    },
    usage: {
      totalRequests: 1500000,
      errorRate: 0.5,
      averageLatency: 250,
      p95Latency: 500
    },
    system: {
      uptime: 99.99,
      serviceHealth: {
        api: "healthy",
        websocket: "healthy",
        database: "healthy",
        cache: "healthy"
      },
      alerts: []
    }
  },
  locations: [],
  usageTrends: [
    { 
      timestamp: new Date().toISOString(), 
      metrics: { 
        requests: 1000, 
        errors: 5, 
        latency: 200, 
        activeUsers: 80 
      } 
    }
  ],
  serviceHealth: [],
  systemAlerts: [],
  recentLogs: []
};

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  // Fonctions utilitaires pour extraire les valeurs en toute sécurité
  const getOrgTotal = () => dashboardData?.globalMetrics?.organizations?.total ?? 0;
  const getOrgActive = () => dashboardData?.globalMetrics?.organizations?.active ?? 0;
  const getOrgInactive = () => getOrgTotal() - getOrgActive();
  const getMRR = () => dashboardData?.globalMetrics?.revenue?.mrr ?? 0;
  const getMRRGrowth = () => dashboardData?.globalMetrics?.revenue?.growth ?? 0;
  const getSystemAlerts = () => dashboardData?.globalMetrics?.system?.alerts?.length ?? 0;

  // Fonction pour vérifier l'authentification
  const checkAuthStatus = () => {
    const tokenInLocalStorage = localStorage.getItem('token');
    const accessTokenInLocalStorage = localStorage.getItem('access_token');
    return tokenInLocalStorage || accessTokenInLocalStorage;
  };

  // Fonction pour récupérer les données du dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les données du dashboard depuis l'API
      const data = await superAdminService.getDashboardData();
      setDashboardData(data);
      
      // Récupérer les organisations depuis l'API
      const orgs = await superAdminService.getOrganizations();
      setOrganizations(orgs);
      
      setUseMockData(false);
    } catch (err) {
      console.error('Erreur de chargement du dashboard:', err);
      
      // Vérifier si l'erreur est due à un problème d'authentification
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Vous n\'êtes pas autorisé à accéder à cette page. Veuillez vous connecter.');
        // Stocker l'URL actuelle pour rediriger après la connexion
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        // En production, rediriger vers la page de connexion
        setIsAuthenticated(false);
        setTimeout(() => router.push('/super-admin/login'), 2000);
      } else {
        setError(err.message || 'Erreur de chargement');
        setDashboardData(mockDashboardData);
        setUseMockData(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effet pour initialiser les données
  useEffect(() => {
    // Vérifier l'authentification
    if (!checkAuthStatus()) {
      console.log('Aucun token trouvé');
      // En production, rediriger
      setIsAuthenticated(false);
      router.push('/super-admin/login');
      return;
    }

    // Charger les données
    fetchDashboardData();
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Accès non autorisé</h2>
          <p className="text-gray-500">Vous n'êtes pas autorisé à accéder à cette page. Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-gray-500">Veuillez patienter pendant le chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Super Admin</h1>
          {useMockData && (
            <p className="text-sm text-amber-600 mt-1">
              Affichage de données de démonstration (API indisponible)
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={fetchDashboardData}
        >
          Rafraîchir
        </Button>
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/super-admin/organizations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <BuildingOfficeIcon className="h-10 w-10 text-indigo-600 mb-3" />
                <h3 className="font-medium">Gérer les organisations</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configurer et administrer les organisations
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <CogIcon className="h-10 w-10 text-indigo-600 mb-3" />
                <h3 className="font-medium">Paramètres système</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configurer les paramètres globaux
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/maintenance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <ServerIcon className="h-10 w-10 text-indigo-600 mb-3" />
                <h3 className="font-medium">Maintenance système</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Gérer les opérations de maintenance
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Organisations</h3>
            <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrgTotal()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {getOrgActive()} actives, {getOrgInactive()} inactives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">MRR</h3>
            <CurrencyEuroIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMRR().toLocaleString()}€
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Croissance: {getMRRGrowth()}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Utilisateurs</h3>
            <UserGroupIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrgTotal()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {getOrgActive()} actifs, {getOrgInactive()} inactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Alertes actives</h3>
            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSystemAlerts()}</div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href="/super-admin/alerts" className="text-indigo-600 hover:underline">
                Voir les détails
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus mensuels */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Revenus Mensuels Récurrents (MRR)</h3>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={
                  dashboardData.usageTrends && dashboardData.usageTrends.length > 0 
                    ? dashboardData.usageTrends.map(trend => ({
                        month: trend.timestamp 
                          ? new Date(trend.timestamp).toLocaleDateString() 
                          : 'N/A',
                        revenue: trend.metrics?.requests ?? 0
                      }))
                    : [{ month: 'N/A', revenue: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} €`, 'Revenus']} 
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  name="Revenus"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution des abonnements */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Distribution des Abonnements</h3>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { subscription_type: 'Basic', count: Math.round(getOrgTotal() * 0.7) },
                  { subscription_type: 'Premium', count: Math.round(getOrgTotal() * 0.3) }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subscription_type" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Organisations']} 
                  labelFormatter={(label) => `Type: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Organisations" 
                  fill="#4f46e5" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance et services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métriques de performance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Métriques de Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Utilisation CPU</span>
                <div className="w-64">
                  <Progress 
                    value={
                      dashboardData?.globalMetrics?.usage?.errorRate 
                        ? dashboardData.globalMetrics.usage.errorRate * 100 
                        : 50
                    } 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Utilisation Mémoire</span>
                <div className="w-64">
                  <Progress 
                    value={
                      dashboardData?.globalMetrics?.usage?.errorRate 
                        ? dashboardData.globalMetrics.usage.errorRate * 100 
                        : 50
                    } 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Taux d'utilisation API</span>
                <div className="w-64">
                  <Progress 
                    value={
                      dashboardData?.globalMetrics?.usage?.errorRate 
                        ? dashboardData.globalMetrics.usage.errorRate * 100 
                        : 50
                    } 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* État des services */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">État des Services</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.globalMetrics?.system?.serviceHealth ? (
                Object.entries(dashboardData.globalMetrics.system.serviceHealth).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="capitalize">{service}</span>
                    <span className={
                      status === 'healthy' ? 'text-green-500' :
                      status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                    }>
                      {status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  Aucune information de service disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Journaux d'activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journaux d'activité récents */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Journaux d'activité récents</h3>
            <Link href="/super-admin/audit-logs" className="text-xs text-indigo-600 hover:underline">
              Voir tous les journaux
            </Link>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentLogs?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentLogs.map((log, index) => (
                  <div key={index} className="flex items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {log?.level || 'INFO'} - {log?.service || 'System'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log?.message || 'No message'} - {log?.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Aucun journal d'activité disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance prévue */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Maintenance Prévue</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Prochaine maintenance</span>
                <Link 
                  href="/super-admin/maintenance" 
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Voir les détails
                </Link>
              </div>
              {dashboardData?.systemAlerts?.length > 0 ? (
                dashboardData.systemAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      alert?.severity === 'high' ? 'bg-red-50 border-red-200' :
                      alert?.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{alert?.message || 'Alerte système'}</span>
                      <span className="text-xs text-gray-500">
                        {alert?.timestamp ? new Date(alert.timestamp).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Aucune maintenance prévue
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}