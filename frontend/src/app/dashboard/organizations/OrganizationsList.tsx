"use client";
import { useOrganizations } from '@/hooks/useOrganizations';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { organizationService } from '@/services/api/organizationService';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <Link href="/dashboard/organizations/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Organisation
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(org.status)}`}>
                      {org.status}
                    </span>
                  </TableCell>
                  <TableCell>{org.memberCount || 0}</TableCell>
                  <TableCell>{org.plan}</TableCell>
                  <TableCell className="text-right space-x-2">
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
                        "Suppression..."
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
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune organisation trouvée
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