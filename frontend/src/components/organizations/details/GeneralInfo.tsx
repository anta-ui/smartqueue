// src/components/organizations/details/OrganizationDetail.tsx
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useOrganization } from '@/hooks/organizations/useOrganization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import GeneralInfo from './GeneralInfo';
import TechnicalConfig from './TechnicalConfig';
import UsageAnalysis from './UsageAnalysis';
import FinancialManagement from './FinancialManagement';

export default function OrganizationDetail() {
  const params = useParams();
  const organizationId = params?.id as string;
  const { organization, loading, error } = useOrganization(organizationId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Organisation non trouvée</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organization.name}</h1>
        <div className="space-x-2">
          <Button variant="outline">Modifier</Button>
          <Button variant="destructive">Supprimer</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tech">Configuration</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="financial">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GeneralInfo organization={organization} />
        </TabsContent>

        <TabsContent value="tech">
          <TechnicalConfig organization={organization} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageAnalysis organization={organization} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialManagement organization={organization} />
        </TabsContent>
      </Tabs>
    </div>
  );
}