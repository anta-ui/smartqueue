'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrganizations, Organization } from '@/hooks/useOrganizations';
import { OrganizationForm } from '@/components/organizations/OrganizationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrganizationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const { organizations, loading, error, refresh, deleteOrganization } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredOrganizations = organizations ? organizations.filter((org: Organization) => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleCreateSuccess = async () => {
    setIsDialogOpen(false);
    await refresh();
    toast({
      title: "Succès",
      description: "Organisation créée avec succès",
    });
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;
  
    try {
      await deleteOrganization(orgToDelete.id);
      
      toast({
        title: "Succès",
        description: "Organisation supprimée avec succès",
        variant: "default"
      });
      
      refresh();
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.message || 
        'Impossible de supprimer l\'organisation';
  
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const renderOrganizationDetails = (org: Organization) => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h4 className="font-semibold mb-4">Informations Générales</h4>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">ID</TableCell>
              <TableCell>{org.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Nom</TableCell>
              <TableCell>{org.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Statut</TableCell>
              <TableCell>
                <Badge
                  variant={
                    org.status === 'active' ? 'success' :
                    org.status === 'inactive' ? 'secondary' :
                    'destructive'
                  }
                >
                  {org.status === 'active' ? 'Actif' :
                   org.status === 'inactive' ? 'Inactif' :
                   'Suspendu'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Plan</TableCell>
              <TableCell>{org.plan || 'Standard'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Statistiques</h4>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Nombre de membres</TableCell>
              <TableCell>{org.memberCount || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Files d'attente actives</TableCell>
              <TableCell>0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Date de création</TableCell>
              <TableCell>
                {org.createdAt 
                  ? new Date(org.createdAt).toLocaleDateString() 
                  : 'Non disponible'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Chargement des organisations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50">
          <CardContent className="py-4">
            <div className="text-red-600 text-center">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Organisations</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              Nouvelle Organisation
            </Button>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Rechercher une organisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Aucune organisation trouvée
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredOrganizations.map((org: Organization) => (
                <AccordionItem key={org.id} value={org.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{org.name}</span>
                        <Badge
                          variant={
                            org.status === 'active' ? 'success' :
                            org.status === 'inactive' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {org.status === 'active' ? 'Actif' :
                           org.status === 'inactive' ? 'Inactif' :
                           'Suspendu'}
                        </Badge>
                      </div>
                      <div 
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link 
                          href={`/dashboard/organizations/${org.id}/edit`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2"
                        >
                          Modifier
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div 
                              role="button" 
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrgToDelete(org);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setOrgToDelete(org);
                                }
                              }}
                              className="inline-block"
                            >
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="pointer-events-none"
                              >
                                Supprimer
                              </Button>
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action va supprimer définitivement l'organisation "{orgToDelete?.name}". 
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
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderOrganizationDetails(org)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Créer une nouvelle organisation</DialogTitle>
          <OrganizationForm 
            onClose={() => setIsDialogOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
