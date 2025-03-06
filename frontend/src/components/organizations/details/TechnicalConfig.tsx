'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { superAdminService } from '@/services/superAdminService';

// Définir les interfaces nécessaires
interface ApiKey {
  id: string;
  name: string;
  key?: string;
  permissions?: string[];
  created_at?: string;
  expires_at?: string;
}

interface Webhook {
  id: string;
  url: string;
  events?: string[];
  active?: boolean;
  created_at?: string;
  last_triggered?: string;
}

interface TechnicalSettings {
  sso_enabled: boolean;
  custom_domain: string | null;
  integrations: {
    slack: boolean;
    teams: boolean;
    jira: boolean;
  };
}

interface TechnicalConfigProps {
  organizationId: number;
}

export function TechnicalConfig({ organizationId }: TechnicalConfigProps) {
  const { toast } = useToast();
  
  // États pour chaque section
  const [organization, setOrganization] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [technicalSettings, setTechnicalSettings] = useState<TechnicalSettings>({
    sso_enabled: false,
    custom_domain: null,
    integrations: {
      slack: false,
      teams: false,
      jira: false
    }
  });

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnicalConfig = async () => {
      try {
        setLoading(true);
        
        // Vérifier si l'ID est valide
        if (!organizationId || isNaN(Number(organizationId))) {
          throw new Error("ID d'organisation invalide");
        }
        
        // Récupérer la configuration technique
        const data = await superAdminService.getOrganizationTechnicalConfig(Number(organizationId));
        console.log("TechnicalConfig - Données reçues:", data);
        
        // Mettre à jour l'état avec les données
        setOrganization(data.organization);
        setApiKeys(data.api_keys || []);
        setWebhooks(data.webhooks || []);
        setTechnicalSettings(data.technical_settings || {
          sso_enabled: false,
          custom_domain: null,
          integrations: {
            slack: false,
            teams: false,
            jira: false
          }
        });
        
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors du chargement de la configuration technique:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger la configuration technique",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
  
    if (organizationId) {
      fetchTechnicalConfig();
    }
  }, [organizationId, toast]);

  // Rendu conditionnel en fonction du chargement
  if (loading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  // Rendu des erreurs
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-600 font-medium">Erreur de chargement</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  // Rendu principal
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Technique</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="api-keys">
          <TabsList>
            <TabsTrigger value="api-keys">Clés API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys">
            <h3 className="text-lg font-semibold mb-4">Clés API</h3>
            {apiKeys.length > 0 ? (
              <div>
                {apiKeys.map((key) => (
                  <div key={key.id} className="border-b py-2">
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Créée le : {key.created_at ? new Date(key.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune clé API trouvée</p>
            )}
          </TabsContent>
          
          <TabsContent value="webhooks">
            <h3 className="text-lg font-semibold mb-4">Webhooks</h3>
            {webhooks.length > 0 ? (
              <div>
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border-b py-2">
                    <p className="font-medium">{webhook.url}</p>
                    <p className="text-sm text-gray-500">
                      Statut : {webhook.active ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun webhook trouvé</p>
            )}
          </TabsContent>
          
          <TabsContent value="integrations">
            <h3 className="text-lg font-semibold mb-4">Intégrations</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>SSO</span>
                <span>{technicalSettings.sso_enabled ? 'Activé' : 'Désactivé'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Domaine personnalisé</span>
                <span>{technicalSettings.custom_domain || 'Non configuré'}</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Intégrations tierces</p>
                <div className="flex justify-between">
                  <span>Slack</span>
                  <span>{technicalSettings.integrations.slack ? 'Connecté' : 'Non connecté'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Teams</span>
                  <span>{technicalSettings.integrations.teams ? 'Connecté' : 'Non connecté'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jira</span>
                  <span>{technicalSettings.integrations.jira ? 'Connecté' : 'Non connecté'}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}