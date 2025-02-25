"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrganization } from '@/hooks/organizations/useOrganization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { organizationService } from '@/services/api/organizationService';
import {GeneralInfo} from './GeneralInfo';
import TechnicalConfig from './TechnicalConfig';
import UsageAnalysis from './UsageAnalysis';
import FinancialManagement from './FinancialManagement';

export default function OrganizationDetail() {
  const { id: organizationId } = useParams();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const { organization, loading, error, mutate } = useOrganization(organizationId);
  
  const handleEdit = () => {
    router.push(`/organizations/${organizationId}/edit`);
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }
    
    try {
      await organizationService.delete(organizationId);
      toast({
        title: "Succès",
        description: "L'organisation a été supprimée avec succès",
      });
      router.push('/organizations'); // Rediriger vers la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    }
  };

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
          <Button variant="outline" onClick={handleEdit}>Modifier</Button>
          <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
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