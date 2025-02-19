'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, Server, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types et interfaces restent les mêmes...

const API_URLS = {
  METRICS: '/api/metrics/',
  ALERTS: '/api/alerts/',
  SERVICE_STATUS: '/api/service/status/',
  USAGE: '/api/usage/',
} as const;

const DashboardPage = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    activeOrgs: 0,
    mrr: 0,
    systemUsage: 0,
    systemHealth: 0
  });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    api: 'healthy',
    websocket: 'healthy',
    thirdParty: 'degraded'
  });
  
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleError = useCallback((key: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [key]: message
    }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const fetchWithErrorHandling = useCallback(async (url: string, key: string) => {
    try {
      clearError(key);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.status === 404) {
        handleError(key, `L'endpoint ${url} n'existe pas`);
        return null;
      }

      if (response.status === 401) {
        handleError(key, 'Session expirée');
        return null;
      }

      if (!response.ok) {
        handleError(key, `Erreur serveur: ${response.status}`);
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        handleError(key, 'Format de réponse invalide');
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      handleError(key, 'Erreur de connexion');
      return null;
    }
  }, [handleError, clearError]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrors({});

    // Chargement des métriques
    const metricsData = await fetchWithErrorHandling(API_URLS.METRICS, 'metrics');
    if (metricsData) {
      setMetrics(metricsData);
    }

    // Chargement des alertes
    const alertsData = await fetchWithErrorHandling(API_URLS.ALERTS, 'alerts');
    setAlerts(Array.isArray(alertsData) ? alertsData : []);

    // Chargement du statut des services
    const statusData = await fetchWithErrorHandling(API_URLS.SERVICE_STATUS, 'status');
    if (statusData) {
      setServiceStatus(statusData);
    }

    // Chargement des données d'utilisation
    const usageData = await fetchWithErrorHandling(API_URLS.USAGE, 'usage');
    setUsageData(Array.isArray(usageData) ? usageData : []);

    setLoading(false);
  }, [fetchWithErrorHandling]);

  // Effet pour le chargement initial et périodique
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Composant LoadingSpinner extrait pour éviter les hooks conditionnels
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Chargement...</div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <Button 
          variant="outline" 
          onClick={loadDashboardData}
          className="flex items-center gap-2"
        >
          Rafraîchir
        </Button>
      </div>

      {/* Affichage des erreurs */}
      {Object.entries(errors).map(([key, message]) => (
        <Alert key={key} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ))}

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Organisations Actives", value: metrics.activeOrgs },
          { title: "MRR", value: `${metrics.mrr}€` },
          { title: "Utilisation Système", value: `${metrics.systemUsage}%` },
          { title: "Santé Système", value: `${metrics.systemHealth}%` }
        ].map((metric, index) => (
          <Card key={`metric-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">{metric.title}</h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique */}
      <Card className="p-4">
        <CardHeader>
          <h3 className="text-lg font-medium">Tendances d'Utilisation</h3>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Services et Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Services Status */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">État des Services</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'API', status: serviceStatus.api, Icon: Server },
                { name: 'WebSocket', status: serviceStatus.websocket, Icon: Activity },
                { name: 'Services Tiers', status: serviceStatus.thirdParty, Icon: Shield }
              ].map((service, index) => (
                <div key={`service-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <service.Icon className="h-4 w-4" />
                    <span>{service.name}</span>
                  </div>
                  <span className={
                    service.status === 'healthy' ? 'text-green-500' :
                    service.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                  }>
                    {service.status === 'healthy' ? 'Opérationnel' :
                     service.status === 'degraded' ? 'Dégradé' : 'Hors service'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Alertes Système</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center">Aucune alerte active</p>
              ) : (
                alerts.map(alert => (
                  <Alert 
                    key={alert.id}
                    variant={alert.severity === 'error' ? 'destructive' : 'default'}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {alert.message}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;