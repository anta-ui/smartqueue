import React, { useState, useEffect } from 'react';
import { apiKeyService } from '@/services/apiKeyService';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface ApiKeysProps {
  organizationId: number;
}

export function ApiKeys({ organizationId }: ApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [featureAvailable, setFeatureAvailable] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchApiKeys = async () => {
      if (!organizationId) return;
      
      try {
        const data = await apiKeyService.getOrganizationApiKeys(organizationId);
        
        if (isMounted) {
          setApiKeys(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des API keys:", err);
        
        if (isMounted) {
          // Si l'erreur indique que la fonctionnalité n'est pas disponible
          if (err.message && err.message.includes("n'est pas encore disponible")) {
            setFeatureAvailable(false);
          } else {
            setError(`Erreur lors du chargement des API keys: ${err.message}`);
          }
          setLoading(false);
        }
      }
    };

    fetchApiKeys();
    
    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleCreateApiKey = async () => {
    try {
      const newKey = await apiKeyService.createApiKey(organizationId, {
        name: `API Key ${apiKeys.length + 1}`,
        // Autres propriétés nécessaires
      });
      setApiKeys([...apiKeys, newKey]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!featureAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clés API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800">
              La fonctionnalité de gestion des clés API n'est pas encore disponible.
              Cette fonctionnalité sera ajoutée prochainement.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clés API</CardTitle>
        <Button onClick={handleCreateApiKey} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle clé
        </Button>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <p className="text-gray-500">Aucune clé API n'a été créée pour cette organisation.</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">Créée le {new Date(key.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Révoquer
                  </Button>
                </div>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                  {key.key_prefix}...{key.key_suffix}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 