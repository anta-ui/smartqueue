'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { BranchesList } from './BranchesList';
import { organizationService } from '@/services/api/organizationService';
import { getCountryDisplayName } from '@/utils/countries';
import { superAdminService } from '@/services/superAdminService';
import { Spinner } from '@/components/ui/spinner';
import { GeneralInfo } from './GeneralInfo';
import { TechnicalConfig } from './TechnicalConfig';
import { UsageAnalysis } from './UsageAnalysis';
import { FinancialManagement } from './FinancialManagement';
import { DataDebugger } from '@/components/debug/DataDebugger';

interface OrganizationDetailsProps {
  organizationId: number | null;
}

interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  plan:'basic' | 'premium';
  country: string;
  created_at?: string;
  updated_at?: string;
}

export function OrganizationDetails({ organizationId }: OrganizationDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        setLoading(true);
        
        if (organizationId === null || organizationId === undefined || isNaN(Number(organizationId))) {
          console.error("ID d'organisation invalide:", organizationId);
          throw new Error("ID d'organisation invalide");
        }
        
        const data = await superAdminService.getOrganizationDetails(organizationId);
        console.log("Données de l'organisation reçues:", data);
        setOrganization(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'organisation:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: `Impossible de récupérer l'organisation ${organizationId}: ${err.message || "Une erreur est survenue"}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [organizationId, toast]);

  useEffect(() => {
    if (error && error.includes("ID d'organisation invalide")) {
      router.push('/super-admin/organizations');
    }
  }, [error, router]);

  const handleEdit = () => {
    router.push(`/super-admin/organizations/${organizationId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }

    try {
      await organizationService.delete(organizationId.toString());
      toast({
        title: "Succès",
        description: "L'organisation a été supprimée avec succès",
      });
      router.push('/super-admin/organizations');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    }
  };

  const goBack = () => router.push('/super-admin/organizations/list');

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/super-admin/organizations')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Organisation non trouvée</h1>
        <Button onClick={() => router.push('/super-admin/organizations')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{organization.name}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/super-admin/organizations')}
          >
            Retour à la liste
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Désactiver" : "Activer"} le mode débogage
          </Button>
        </div>
      </div>
      
      {debugMode && (
        <DataDebugger data={organization} title="Données de l'organisation" />
      )}
      
      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Informations Générales</TabsTrigger>
          <TabsTrigger value="technical">Configuration Technique</TabsTrigger>
          <TabsTrigger value="usage">Analyse d'Utilisation</TabsTrigger>
          <TabsTrigger value="financial">Gestion Financière</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralInfo organizationId={organization.id} />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalConfig organizationId={organization.id} />
        </TabsContent>
        
        <TabsContent value="usage">
          <UsageAnalysis organizationId={organization.id} />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialManagement organizationId={organization.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}