'use client';
import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/services/api/organizationService';
import { EditOrganizationForm } from '@/components/organizations/EditOrganizationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function EditOrganizationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Utiliser React.use pour accéder aux paramètres
  const resolvedParams = use(params);
  const organizationId = resolvedParams.id;
  
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const data = await organizationService.getById(organizationId);
        setOrganization(data);
        setError(null);
      } catch (error) {
        console.error('Erreur de chargement:', error);
        setError('Impossible de charger les détails de l\'organisation');
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de l\'organisation',
          variant: 'destructive'
        });
        router.push('/dashboard/organizations');
      } finally {
        setLoading(false);
      }
    }
    fetchOrganization();
  }, [organizationId, router, toast]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Modifier l'Organisation</CardTitle>
        </CardHeader>
        <CardContent>
          {organization ? (
            <EditOrganizationForm
              organization={organization}
              onClose={() => router.push('/dashboard/organizations')}
            />
          ) : (
            <p>Aucune organisation trouvée</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}