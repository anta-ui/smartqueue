'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/services/api/organizationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { BranchesList } from './BranchesList';

interface OrganizationDetailProps {
  organizationId: string;
}

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const data = await organizationService.getById(organizationId);
        setOrganization(data);
      } catch (err) {
        console.error("Erreur lors du chargement de l'organisation:", err);
        setError("Impossible de charger les détails de l'organisation");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId && organizationId !== 'new') {
      fetchOrganization();
    } else if (organizationId === 'new') {
      // Rediriger vers la page de création si nécessaire
      router.push('/dashboard/organizations/new');
    }
  }, [organizationId, router]);

  const handleEdit = () => {
    router.push(`/dashboard/organizations/${organizationId}/edit`);
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
      router.push('/dashboard/organizations');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    router.push('/dashboard/organizations');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="space-x-2">
            <Skeleton className="h-10 w-24 inline-block" />
            <Skeleton className="h-10 w-24 inline-block" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={goBack}>Retour à la liste</Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <p className="text-gray-500">Organisation non trouvée</p>
        <Button onClick={goBack}>Retour à la liste</Button>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(organization.status)}`}>
            {organization.status}
          </span>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium">{organization.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{organization.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Région</p>
                  <p className="font-medium">{organization.region}</p>
                </div>
                {organization.created_at && (
                  <div>
                    <p className="text-sm text-gray-500">Créée le</p>
                    <p className="font-medium">
                      {new Date(organization.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {organization.updated_at && (
                  <div>
                    <p className="text-sm text-gray-500">Dernière mise à jour</p>
                    <p className="font-medium">
                      {new Date(organization.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardContent className="p-0">
              <BranchesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                La fonctionnalité de gestion des membres sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                La fonctionnalité de paramètres sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}