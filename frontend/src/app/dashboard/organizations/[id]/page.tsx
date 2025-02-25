// src/app/dashboard/organizations/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { organizationService } from '@/services/api/organizationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchesList } from '@/components/organizations/BranchesList';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const data = await organizationService.getById(id);
        setOrganization(data);
      } catch (err) {
        setError('Impossible de charger les détails de l\'organisation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{organization?.name || 'Détails de l\'organisation'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              {/* Détails de l'organisation */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium">Plan</p>
                  <p>{organization?.plan || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <p>{organization?.status || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Région</p>
                  <p>{organization?.region || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date de création</p>
                  <p>{organization?.created_at 
                      ? new Date(organization.created_at).toLocaleDateString() 
                      : '-'}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="branches">
              {/* Liste des branches */}
              <BranchesList organizationId={id} />
            </TabsContent>
            
            <TabsContent value="members">
              {/* Liste des membres - à implémenter plus tard */}
              <div className="p-4 text-center text-gray-500">
                La gestion des membres sera bientôt disponible.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}