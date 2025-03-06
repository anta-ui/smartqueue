'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  AlertTriangle, 
  ArrowUpCircle, 
  Mail, 
  Ban,
  Search,
  FileText,
  Settings,
  BarChart2,
  CreditCard 
} from 'lucide-react';
import { GeneralInfo } from '@/components/organizations/details/GeneralInfo';
import { TechnicalConfig } from '@/components/organizations/details/TechnicalConfig';
import { UsageAnalysis } from '@/components/organizations/details/UsageAnalysis';
import { FinancialManagement } from '@/components/organizations/details/FinancialManagement';
import { superAdminService } from '@/services/superAdminService';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { DataDebugger } from '@/components/debug/DataDebugger';

// Type pour les organisations
interface Organization {
  id: string;
  name: string;
  plan: string;
  status?: string;
  region?: string;
  createdAt?: string;
  contacts?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  legalDocs?: Array<{
    name: string;
    url: string;
    status: string;
  }>;
}

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [debugMode, setDebugMode] = useState(false); // Désactivé par défaut en production

  // Actions rapides pour l'organisation
  const handleSuspendOrganization = async () => {
    if (!organizationId) return;
    try {
      await superAdminService.suspendOrganization(organizationId);
      // Mettre à jour les données de l'organisation après la suspension
      const updatedData = await superAdminService.getOrganizationDetails(organizationId);
      setOrganization(updatedData);
      toast({
        title: "Organisation suspendue",
        description: "L'organisation a été suspendue avec succès",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors de la suspension de l'organisation:", err);
      toast({
        title: "Erreur",
        description: `Impossible de suspendre l'organisation: ${err.message || "Une erreur est survenue"}`,
        variant: "destructive",
      });
    }
  };

  const handleUpgradeOrganization = async () => {
    if (!organizationId) return;
    try {
      // Implémenter la logique d'upgrade
      console.log("Upgrade de l'organisation", organizationId);
      toast({
        title: "Upgrade en cours",
        description: "La demande d'upgrade a été envoyée",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors de l'upgrade de l'organisation:", err);
      toast({
        title: "Erreur",
        description: `Impossible d'upgrader l'organisation: ${err.message || "Une erreur est survenue"}`,
        variant: "destructive",
      });
    }
  };

  const handleContactOrganization = async () => {
    if (!organizationId) return;
    try {
      // Implémenter la logique de contact
      console.log("Contact de l'organisation", organizationId);
      toast({
        title: "Contact",
        description: "Un email a été envoyé aux contacts de l'organisation",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors du contact de l'organisation:", err);
      toast({
        title: "Erreur",
        description: `Impossible de contacter l'organisation: ${err.message || "Une erreur est survenue"}`,
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    if (!organizationId) return;
    try {
      // Implémenter la logique d'export
      await superAdminService.exportOrganizationData(organizationId);
      toast({
        title: "Export réussi",
        description: "Les données ont été exportées avec succès",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors de l'export des données:", err);
      toast({
        title: "Erreur",
        description: `Impossible d'exporter les données: ${err.message || "Une erreur est survenue"}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'ID de l'organisation depuis les paramètres d'URL
        const id = params?.id;
        if (!id || Array.isArray(id)) {
          throw new Error("ID d'organisation invalide");
        }
        
        // Convertir l'ID en nombre
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error("ID d'organisation invalide");
        }
        
        setOrganizationId(numericId);
        
        // Récupérer les détails de l'organisation
        const data = await superAdminService.getOrganizationDetails(numericId);
        setOrganization(data);
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données de l'organisation:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger les données de l'organisation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [params, toast]);

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

  return (
    <div className="container mx-auto p-4">
      {/* En-tête avec le nom de l'organisation et actions rapides */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {organization?.name || `Organisation #${organizationId}`}
          </h1>
          <div className="flex items-center mt-2">
            <span className={`px-3 py-1 text-xs rounded-full ${
              organization?.status === 'active' ? 'bg-green-100 text-green-800' : 
              organization?.status === 'suspended' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {organization?.status || 'Inconnu'}
            </span>
            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {organization?.plan || 'Plan inconnu'}
            </span>
            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              {organization?.region || 'Région inconnue'}
            </span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleSuspendOrganization}>
            <Ban className="h-4 w-4 mr-2" />
            Suspendre
          </Button>
          <Button variant="outline" size="sm" onClick={handleUpgradeOrganization}>
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Upgrader
          </Button>
          <Button variant="outline" size="sm" onClick={handleContactOrganization}>
            <Mail className="h-4 w-4 mr-2" />
            Contacter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {debugMode ? "Désactiver" : "Activer"} le débogage
          </Button>
        </div>
      </div>
      
      {/* Afficher les données brutes en mode débogage */}
      {debugMode && organization && (
        <div className="mb-6">
          <DataDebugger data={organization} title="Données de l'organisation" />
        </div>
      )}
      
      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configuration technique
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analyse d'utilisation
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Gestion financière
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          {organizationId && (
            <GeneralInfo organizationId={organizationId} />
          )}
        </TabsContent>
        
        <TabsContent value="technical">
          {organizationId && (
            <TechnicalConfig organizationId={organizationId} />
          )}
        </TabsContent>
        
        <TabsContent value="usage">
          {organizationId && (
            <UsageAnalysis organizationId={organizationId} />
          )}
        </TabsContent>
        
        <TabsContent value="financial">
          {organizationId && (
            <FinancialManagement organizationId={organizationId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}