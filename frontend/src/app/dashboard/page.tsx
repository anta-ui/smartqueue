'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, Server, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    activeOrgs: 0,
    mrr: 0,
    systemUsage: 0,
    systemHealth: 0
  });

  const [alerts, setAlerts] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({
    api: 'healthy',
    websocket: 'healthy',
    thirdParty: 'degraded'
  });

  // Données simulées pour le graphique
  const usageData = [
    { name: 'Jan', value: 65 },
    { name: 'Fév', value: 75 },
    { name: 'Mar', value: 85 },
    { name: 'Avr', value: 82 },
    { name: 'Mai', value: 90 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        <Button variant="outline">
          Rafraîchir
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Organisations Actives</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeOrgs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">MRR</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mrr}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Utilisation Système</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemUsage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Santé Système</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemHealth}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de tendances */}
      <Card className="p-4">
        <CardHeader>
          <h3 className="text-lg font-medium">Tendances d'Utilisation</h3>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* État des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">État des Services</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>API</span>
                </div>
                <span className="text-green-500">Opérationnel</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>WebSocket</span>
                </div>
                <span className="text-green-500">Opérationnel</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Services Tiers</span>
                </div>
                <span className="text-yellow-500">Dégradé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertes Système */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Alertes Système</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Charge CPU élevée sur le serveur principal
                </AlertDescription>
              </Alert>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Latence réseau détectée dans la région EU-West
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;