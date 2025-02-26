'use client';
import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/services/api/organizationService';
import { EditOrganizationForm } from '@/components/organizations/EditOrganizationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';

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
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement des données de l'organisation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-800 text-lg font-medium mb-2">Erreur</p>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/dashboard/organizations')}
            variant="outline"
            className="hover:bg-red-50"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/organizations')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
      </div>

      <Card className="shadow-md border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{organization?.name || 'Organisation'}</CardTitle>
              <CardDescription>Modifiez les informations de cette organisation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {organization ? (
            <EditOrganizationForm
              organization={organization}
              onClose={() => router.push('/dashboard/organizations')}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune organisation trouvée</p>
              <Button 
                onClick={() => router.push('/dashboard/organizations')}
                className="mt-4"
              >
                Retour à la liste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}