'use client';

import { useState } from 'react';
import Link from 'next/link';
import { organizationService } from '@/services/api/organizationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrganizationForm } from '@/components/organizations/OrganizationForm';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function OrganizationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const { organizations, loading, error, deleteOrganization, refresh } = useOrganizations();
  const { toast } = useToast();

  const handleCreateSuccess = () => {
    refresh(); // Rechargez la liste après création
    setIsFormOpen(false);
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;

    try {
      await deleteOrganization(orgToDelete);
      toast({
        title: "Succès",
        description: "Organisation supprimée avec succès",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  if (error) return (
    <div className="p-6">
      <Card className="bg-red-50">
        <CardContent className="py-4">
          <div className="text-red-600 text-center">{error}</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Organisations</CardTitle>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'Annuler' : 'Nouvelle Organisation'}
          </Button>
        </CardHeader>
        
        {isFormOpen && (
          <CardContent>
            <OrganizationForm
              onClose={() => setIsFormOpen(false)}
              onSuccess={handleCreateSuccess}
            />
          </CardContent>
        )}
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.plan}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        org.status === 'active' ? 'default' :
                        org.status === 'inactive' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.region}</TableCell>
                  <TableCell className="space-x-2">
                    <Link 
                      href={`/dashboard/organizations/${org.id}/edit`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2"
                    >
                      Modifier
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrgToDelete(org.id);
                          }}
                        >
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action va supprimer définitivement l'organisation "{org.name}". 
                            Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteOrganization}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}