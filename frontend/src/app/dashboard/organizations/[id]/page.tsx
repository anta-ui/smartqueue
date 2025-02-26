'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { organizationService } from '@/services/api/organizationService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BranchesList } from '@/components/organizations/BranchesList';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = () => {
    router.push(`/dashboard/organizations/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await organizationService.delete(id);
      toast({
        title: "Succès",
        description: "L'organisation a été supprimée avec succès",
      });
      router.push('/dashboard/organizations');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const goBack = () => {
    router.push('/dashboard/organizations');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Actif
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Inactif
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'free':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Gratuit</Badge>;
      case 'basic':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Basic</Badge>;
      case 'premium':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Premium</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{plan}</Badge>;
    }
  };

  const getRegionDisplay = (region) => {
    switch (region) {
      case 'north': return 'Nord';
      case 'south': return 'Sud';
      case 'east': return 'Est';
      case 'west': return 'Ouest';
      case 'central': return 'Centre';
      default: return region;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Chargement des détails de l'organisation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-800 text-lg font-medium mb-2">Erreur</p>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={goBack} className="bg-red-600 hover:bg-red-700">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack} className="rounded-full h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{organization?.name || 'Détails de l\'organisation'}</h1>
            <div className="flex items-center gap-2 mt-1">
              {organization?.status && getStatusBadge(organization.status)}
              {organization?.plan && getPlanBadge(organization.plan)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-gray-50 border-b border-gray-200 p-0 rounded-t-lg">
              <TabsTrigger 
                value="details" 
                className="flex items-center data-[state=active]:bg-white rounded-none border-r border-gray-200 py-3 px-4"
              >
                <Building className="h-4 w-4 mr-2" />
                Détails
              </TabsTrigger>
              <TabsTrigger 
                value="branches"
                className="flex items-center data-[state=active]:bg-white rounded-none border-r border-gray-200 py-3 px-4"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Branches
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className="flex items-center data-[state=active]:bg-white rounded-none py-3 px-4"
              >
                <Users className="h-4 w-4 mr-2" />
                Membres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-none border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Informations générales</CardTitle>
                    <CardDescription>Détails principaux de l'organisation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Nom</dt>
                        <dd className="mt-1 text-gray-900 font-medium">{organization?.name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Statut</dt>
                        <dd className="mt-1">{organization?.status ? getStatusBadge(organization.status) : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Plan</dt>
                        <dd className="mt-1">{organization?.plan ? getPlanBadge(organization.plan) : '-'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card className="shadow-none border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Localisation & Dates</CardTitle>
                    <CardDescription>Informations géographiques et temporelles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Région</dt>
                        <dd className="mt-1 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{organization?.region ? getRegionDisplay(organization.region) : '-'}</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                        <dd className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {organization?.created_at
                              ? new Date(organization.created_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : '-'}
                          </span>
                        </dd>
                      </div>
                      {organization?.updated_at && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Dernière mise à jour</dt>
                          <dd className="mt-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>
                              {new Date(organization.updated_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="branches" className="p-0 pt-1">
              <BranchesList organizationId={id} />
            </TabsContent>

            <TabsContent value="members" className="p-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Gestion des membres</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Cette fonctionnalité sera bientôt disponible. Vous pourrez ajouter, modifier et gérer les membres de cette organisation.
                </p>
                <Button variant="outline" disabled>Bientôt disponible</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}