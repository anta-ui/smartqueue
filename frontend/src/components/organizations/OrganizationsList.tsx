"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Building, 
  Filter, 
  Eye, 
  RefreshCw,
  Users
} from 'lucide-react';

// Imports des composants UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Imports du service et hooks
import { organizationService } from '@/services/api/organizationService';
import { useOrganizations } from '@/hooks/useOrganizations';

// Types
interface Organization {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  memberCount: number;
  plan: 'free' | 'basic' | 'premium';
}

export function OrganizationsList() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localOrganizations, setLocalOrganizations] = useState<Organization[]>([]);

  // Hooks
  const { 
    organizations, 
    loading, 
    error, 
    mutate: refreshOrganizations 
  } = useOrganizations();
  const { toast } = useToast();
  const router = useRouter();

  // Synchroniser l'état local avec les données du hook
  useEffect(() => {
    if (organizations) {
      setLocalOrganizations(organizations);
    }
  }, [organizations]);

  // Utilitaires pour les badges
  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      'active': "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      'inactive': "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
      'pending': "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
    };

    return (
      <Badge 
        variant="outline" 
        className={badgeStyles[status as keyof typeof badgeStyles] || badgeStyles.pending}
      >
        {status === 'active' ? 'Actif' : 
         status === 'inactive' ? 'Inactif' : 
         'En attente'}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planStyles = {
      'free': "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      'basic': "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      'premium': "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
    };

    return (
      <Badge 
        className={planStyles[plan as keyof typeof planStyles] || "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}
      >
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  // Gestionnaires
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrganizations();
      toast({
        title: "Actualisation réussie",
        description: "La liste des organisations a été mise à jour"
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les organisations",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (organizationId: number) => {
    const confirmed = window.confirm('Voulez-vous vraiment supprimer cette organisation ?');
    if (!confirmed) return;
  
    try {
      setIsDeleting(organizationId);
      
      // Supprimer l'organisation via l'API
      await organizationService.delete(organizationId);
      
      // Mettre à jour l'état local immédiatement
      setLocalOrganizations(prevOrgs => 
        prevOrgs.filter(org => org.id !== organizationId)
      );
      
      // Rafraîchir les données si possible, sinon utiliser un rechargement de page
      if (typeof refreshOrganizations === 'function') {
        try {
          await refreshOrganizations();
        } catch (refreshError) {
          console.log("Erreur lors du rafraîchissement des données:", refreshError);
          // Optionnel: window.location.reload();
        }
      } else {
        console.log("refreshOrganizations n'est pas une fonction, utilisation de l'état local uniquement");
      }
      
      toast({
        title: "Suppression réussie",
        description: "L'organisation a été supprimée",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Erreur de suppression:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'organisation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Navigation vers les détails et modification
  const handleViewDetails = (organizationId: number) => {
    router.push(`/super-admin/organizations/${organizationId}`);
  };

  const handleEditOrganization = (organizationId: number) => {
    router.push(`/super-admin/organizations/${organizationId}/edit`);
  };

  const handleViewMembers = (organizationId: number) => {
    router.push(`/super-admin/organizations/${organizationId}/members`);
  };

  // Filtrage des organisations
  const filteredOrganizations = localOrganizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Rendu de chargement
  if (loading && localOrganizations.length === 0) return <OrganizationsListSkeleton />;

  // Rendu d'erreur
  if (error && localOrganizations.length === 0) return <OrganizationsErrorView error={error} onRetry={handleRefresh} />;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Organisations</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
          <Link href="/super-admin/organizations/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Organisation
            </Button>
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des organisations */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Membres
                  </div>
                </TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucune organisation trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrganizations.map(org => (
                  <TableRow key={org.id}>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{getStatusBadge(org.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewMembers(org.id)}
                        className="flex items-center"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {org.memberCount} membre{org.memberCount !== 1 ? 's' : ''}
                      </Button>
                    </TableCell>
                    <TableCell>{getPlanBadge(org.plan)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(org.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOrganization(org.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isDeleting === org.id}
                        onClick={() => handleDelete(org.id)}
                      >
                        {isDeleting === org.id ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour l'affichage du chargement
function OrganizationsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-60" />
      </div>
      
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour l'affichage des erreurs
function OrganizationsErrorView({ error, onRetry }: { error: string, onRetry: () => void }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-red-600">Erreur</CardTitle>
        <CardDescription>Impossible de charger les organisations</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{error}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
}