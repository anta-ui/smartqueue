'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { branchService } from '@/services/api/branchService';
import { BranchForm } from './BranchForm';

export function BranchesList() {
  const { id: organizationId } = useParams();
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { toast } = useToast();

  // Charger les branches de l'organisation
  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getByOrganization(organizationId);
      setBranches(data);
    } catch (err) {
      setError('Impossible de charger les branches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadBranches();
    }
  }, [organizationId]);

  // Gérer la création réussie
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadBranches();
    toast({
      title: 'Succès',
      description: 'Branche créée avec succès',
    });
  };

  // Gérer la mise à jour réussie
  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    loadBranches();
    toast({
      title: 'Succès',
      description: 'Branche mise à jour avec succès',
    });
  };

  // Supprimer une branche
  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette branche?')) return;
    
    try {
      await branchService.delete(id);
      loadBranches();
      toast({
        title: 'Succès',
        description: 'Branche supprimée avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la branche',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Chargement des branches...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Branches</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Branche
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {branches.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune branche trouvée. Créez votre première branche.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.code}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>
                      <Badge variant={branch.is_active ? "success" : "destructive"}>
                        {branch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBranch(branch);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogTitle>Créer une nouvelle branche</DialogTitle>
          <BranchForm 
            organizationId={organizationId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modale d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogTitle>Modifier la branche</DialogTitle>
          {selectedBranch && (
            <BranchForm 
              branch={selectedBranch}
              organizationId={organizationId}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setIsEditModalOpen(false)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}