// src/app/dashboard/organizations/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ListOrdered, 
  Plus, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Package 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Skeleton } from '@/components/ui/skeleton';

// Fonction pour générer des données de croissance historique
const generateHistoricalData = (organizations) => {
  if (!organizations || organizations.length === 0) return [];

  // Trier les organisations par date de création
  const sortedOrgs = [...organizations].sort((a, b) => 
    new Date(a.createdAt || Date.now()).getTime() - 
    new Date(b.createdAt || Date.now()).getTime()
  );

  // Créer un tableau des 12 derniers mois
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Calculer la croissance mensuelle
  const historicalData = monthNames.map((month, index) => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - (11 - index));
    
    const monthOrgs = sortedOrgs.filter(org => {
      const orgDate = new Date(org.createdAt || Date.now());
      return orgDate.getMonth() === currentDate.getMonth() && 
             orgDate.getFullYear() === currentDate.getFullYear();
    });

    return {
      month,
      total: monthOrgs.length,
      active: monthOrgs.filter(org => org.status === 'active').length
    };
  });

  return historicalData;
};

export default function OrganizationsPage() {
  const router = useRouter();
  const { organizations, loading, error } = useOrganizations();

  // Calculs mémoïsés pour éviter les recalculs inutiles
  const metrics = useMemo(() => {
    if (!organizations) return {
      totalOrganizations: 0,
      activeOrganizations: 0,
      averageMemberCount: 0,
      planDistribution: { free: 0, basic: 0, premium: 0 }
    };

    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter(org => org.status === 'active').length;
    const averageMemberCount = Math.round(
      organizations.reduce((sum, org) => sum + (org.memberCount || 0), 0) / totalOrganizations
    );

    const planDistribution = organizations.reduce((acc, org) => {
      acc[org.plan] = (acc[org.plan] || 0) + 1;
      return acc;
    }, { free: 0, basic: 0, premium: 0 });

    return {
      totalOrganizations,
      activeOrganizations,
      averageMemberCount,
      planDistribution
    };
  }, [organizations]);

  // Préparer les données pour les graphiques
  const historicalData = useMemo(() => generateHistoricalData(organizations), [organizations]);
  const planDistributionData = useMemo(() => [
    { name: 'Gratuit', value: metrics.planDistribution.free, color: '#3B82F6' },
    { name: 'Basic', value: metrics.planDistribution.basic, color: '#10B981' },
    { name: 'Premium', value: metrics.planDistribution.premium, color: '#F43F5E' }
  ], [metrics.planDistribution]);

  // État de chargement
  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord des Organisations</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/organizations/list')}
          >
            <ListOrdered className="h-4 w-4 mr-2" />
            Liste des Organisations
          </Button>
          <Button onClick={() => router.push('/dashboard/organizations/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Organisation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Organisations Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organisations</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Nombre total d'organisations
            </p>
          </CardContent>
        </Card>

        {/* Carte Organisations Actives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organisations Actives</CardTitle>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.activeOrganizations / metrics.totalOrganizations) * 100) || 0}% du total
            </p>
          </CardContent>
        </Card>

        {/* Carte Membres Moyens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres Moyens</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageMemberCount}</div>
            <p className="text-xs text-muted-foreground">Par organisation</p>
          </CardContent>
        </Card>

        {/* Graphique de croissance des organisations */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Croissance des Organisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    name="Actives" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution des plans en Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}