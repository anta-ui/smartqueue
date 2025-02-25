// src/app/dashboard/queue-types/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, List, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CreateQueueTypeForm } from '@/components/queues/CreateQueueTypeForm';
import { queueTypeService } from '@/services/queueTypeService';

export default function QueueTypesPage() {
  const router = useRouter();
  const [queueTypes, setQueueTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateQueueModalOpen, setIsCreateQueueModalOpen] = useState(false);

  // Chargement des types de files
  const loadQueueTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await queueTypeService.getQueueTypes();
      console.log("Types de files récupérés:", types);
      
      if (Array.isArray(types)) {
        setQueueTypes(types);
      } else {
        console.error("Format de réponse incorrect:", types);
        setError("Format de réponse incorrect");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des types de files:", err);
      setError("Impossible de charger les types de files");
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadQueueTypes();
  }, []);

  // Redirection vers la création de file d'attente
  const handleCreateQueue = () => {
    // Option 1: Rediriger vers la page de création de file
    router.push('/dashboard/queues?createNew=true');
    
    // Option 2: Ouvrir la modale de création de file (si vous préférez)
    // setIsCreateQueueModalOpen(true);
  };

  // Fonction pour supprimer un type
  const handleDeleteQueueType = async (id) => {
    try {
      await queueTypeService.deleteQueueType(id);
      setQueueTypes(queueTypes.filter(type => type.id !== id));
      
      toast({
        title: 'Succès',
        description: 'Type de file supprimé',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le type de file',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Types de Files d'Attente</h1>
        <div className="flex space-x-4">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2" />
            Nouveau Type de File
          </Button>
          
          {/* Bouton pour créer une file d'attente */}
          {queueTypes.length > 0 && (
            <Button 
              onClick={handleCreateQueue}
              variant="secondary"
            >
              <List className="mr-2" />
              Créer une File d'Attente
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Total des types</p>
              <p className="text-2xl font-bold">{queueTypes.length}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{queueTypes.length}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Types actifs</p>
              <p className="text-2xl font-bold">
                {queueTypes.filter(type => type.is_active).length}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {queueTypes.filter(type => type.is_active).length}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Types inactifs</p>
              <p className="text-2xl font-bold">
                {queueTypes.filter(type => !type.is_active).length}
              </p>
            </div>
            <Badge className="bg-red-100 text-red-800">
              {queueTypes.filter(type => !type.is_active).length}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Message pour encourager la création de file d'attente */}
      {queueTypes.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Vous avez {queueTypes.length} type(s) de file d'attente disponible(s). 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-700 underline"
                  onClick={handleCreateQueue}
                >
                  Créer une file d'attente
                </Button> 
                maintenant ?
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">Chargement...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : queueTypes.length === 0 ? (
            <div className="p-6 text-center">
              Aucun type de file d'attente trouvé. Créez-en un pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Temps de Service</TableHead>
                  <TableHead>Capacité Max</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueTypes.map(type => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>
                      {type.category === 'VE' ? 'Véhicule' : 
                       type.category === 'PE' ? 'Personne' : 'Mixte'}
                    </TableCell>
                    <TableCell>
                      {type.estimated_service_time || '-'} min
                    </TableCell>
                    <TableCell>
                      {type.max_capacity || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={type.is_active ? 'success' : 'destructive'}
                      >
                        {type.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            // Logique de modification (à implémenter ultérieurement)
                            toast({
                              title: 'Information',
                              description: 'La modification sera disponible dans une future mise à jour.'
                            });
                          }}
                        >
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteQueueType(type.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Actions en pied de page */}
      {queueTypes.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleCreateQueue}
            size="lg"
            className="px-8"
          >
            <PlusCircle className="mr-2" />
            Créer une Nouvelle File d'Attente
          </Button>
        </div>
      )}

      {/* Modal de création de type de file */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      >
        <CreateQueueTypeForm 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadQueueTypes();
          }}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
}