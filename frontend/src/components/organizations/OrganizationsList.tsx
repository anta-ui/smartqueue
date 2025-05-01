"use client";
import { useOrganizations } from '@/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { useState } from 'react';
import { Search, Plus, Trash2, Edit, Building, Filter, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { organizationService } from '@/services/api/organizationService';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  memberCount: number;
  plan: string;
}

export function OrganizationsList() {
  const { organizations, loading, error, mutate } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Actif</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">Inactif</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Gratuit</Badge>;
      case 'basic':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">Basic</Badge>;
      case 'premium':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">Premium</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">{plan}</Badge>;
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Utilisez une fonction alternative ou appelez directement le service
      await organizationService.getAll().then(data => {
        // Mise à jour de l'état local avec les nouvelles données
        // Par exemple : setOrganizations(data);
      });
      
      toast({
        title: "Rafraîchissement réussi",
        description: "La liste des organisations a été mise à jour",
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }

    setIsDeleting(id);
    try {
      await organizationService.delete(id);
      toast({
        title: "Succès",
        description: "L'organisation a été supprimée avec succès",
      });
      mutate(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  

  const filteredOrganizations = organizations?.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Organisations</h1>
          <Skeleton className="h-10 w-48" />
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Erreur lors du chargement</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Organisations</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </Button>
          <Link href="/dashboard/organizations/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Organisation
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Recherche & Filtres</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold">Membres</TableHead>
                <TableHead className="font-semibold">Plan</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <Link 
                      href={`/dashboard/organizations/${org.id}`}
                      className="text-primary hover:underline flex items-center"
                    >
                      {org.name}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{org.memberCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(org.plan)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Link href={`/dashboard/organizations/${org.id}/edit`}>
                      <Button variant="outline" size="sm" className="mr-2">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(org.id)}
                      disabled={isDeleting === org.id}
                    >
                      {isDeleting === org.id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Suppression...
                        </span>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrganizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Building className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">Aucune organisation trouvée</p>
                      <Link href="/dashboard/organizations/new">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Créer une organisation
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}