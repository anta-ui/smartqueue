// src/app/dashboard/queues/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { queueService } from '@/services/queueService';
import  {CreateQueueForm}  from '@/components/queues/CreateQueueForm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';

// Types
type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  current_number: number;
  current_wait_time: number;
  queue_type: string;
}

export default function QueuesPage() {
  // États
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queueTypes, setQueueTypes] = useState<Queue[]>([]);
  const [filteredQueues, setFilteredQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de l'interface
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<QueueStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Chargement initial des files d'attente
  useEffect(() => {
    loadQueues();
  }, []);

  // Filtrage des files d'attente
  useEffect(() => {
    let result = queues;

    // Filtrage par statut
    if (statusFilter !== 'ALL') {
      result = result.filter(queue => queue.status === statusFilter);
    }

    // Filtrage par recherche
    if (searchTerm) {
      result = result.filter(queue => 
        queue.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQueues(result);
  }, [queues, statusFilter, searchTerm]);

  // Charger les files d'attente
  const loadQueues = async () => {
    try {
      setLoading(true);
      const response = await queueService.getQueues();
      console.log('Réponse API complète:', response);
      
      let queuesData = [];
      if (Array.isArray(response)) {
        queuesData = response;
      } else if (typeof response === 'object' && response !== null) {
        // Si la réponse est un objet, essayez de trouver un tableau à l'intérieur
        const possibleArrays = Object.values(response).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          queuesData = possibleArrays[0];
        }
      }
      
      console.log('Données des files d\'attente:', queuesData);
      setQueues(queuesData);
      
      if (queuesData.length === 0) {
        console.warn('Aucune file d\'attente trouvée');
      }
    } catch (err) {
      setError('Impossible de charger les files d\'attente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une file d'attente
  const handleDeleteQueue = async (id: string) => {
    try {
      await queueService.deleteQueue(id);
      setQueues(queues.filter(q => q.id !== id));
      toast({
        title: 'Succès',
        description: 'File d\'attente supprimée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la file d\'attente',
        variant: 'destructive'
      });
    }
  };

  // Mettre à jour le statut
  const handleStatusChange = async (id: string, newStatus: QueueStatus) => {
    try {
      await queueService.updateQueueStatus(id, newStatus);
      setQueues(queues.map(q => 
        q.id === id ? { ...q, status: newStatus } : q
      ));
      toast({
        title: 'Succès',
        description: 'Statut de la file d\'attente mis à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive'
      });
    }
  };
  const loadQueueTypes = async () => {
    try {
      const types = await queueService.getQueueTypes();
      console.log("Types de files reçus:", types);
      setQueueTypes(types);
    } catch (error) {
      console.error("Erreur lors du chargement des types de files d'attente", error.response || error);
    }
  };
  // Statistiques
  const queueStats = useMemo(() => {
    if (!Array.isArray(queues)) {
      return {
        total: 0,
        active: 0,
        paused: 0,
        closed: 0,
      };
    }
    return {
      total: queues.length,
      active: queues.filter(q => q.status === 'ACTIVE').length,
      paused: queues.filter(q => q.status === 'PAUSED').length,
      closed: queues.filter(q => q.status === 'CLOSED').length,
    };
  }, [queues]);

  // Rendu du composant
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Files d'Attente</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Icons.Plus className="mr-2" />
          Nouvelle File d'Attente
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: queueStats.total, color: 'bg-blue-100 text-blue-800' },
          { label: 'Actives', value: queueStats.active, color: 'bg-green-100 text-green-800' },
          { label: 'En Pause', value: queueStats.paused, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Fermées', value: queueStats.closed, color: 'bg-red-100 text-red-800' }
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <Badge className={stat.color}>{stat.value}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="flex space-x-4">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as QueueStatus | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="PAUSED">En Pause</SelectItem>
            <SelectItem value="CLOSED">Fermé</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          placeholder="Rechercher une file d'attente" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>

      {/* Liste des files d'attente */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Numéro Actuel</TableHead>
                <TableHead>Temps d'Attente</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueues.map(queue => (
                <TableRow key={queue.id}>
                  <TableCell>{queue.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        queue.status === 'ACTIVE' ? 'success' :
                        queue.status === 'PAUSED' ? 'warning' : 'destructive'
                      }
                    >
                      {queue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{queue.current_number}</TableCell>
                  <TableCell>{queue.current_wait_time} min</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          // Logique de modification
                        }}
                      >
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(
                          queue.id, 
                          queue.status === 'ACTIVE' ? 'PAUSED' : 
                          queue.status === 'PAUSED' ? 'CLOSED' : 'ACTIVE'
                        )}
                      >
                        {queue.status === 'ACTIVE' ? 'Mettre en Pause' : 
                         queue.status === 'PAUSED' ? 'Fermer' : 'Activer'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteQueue(queue.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de création */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      >
        <CreateQueueForm 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadQueues();
          }}
        />
      </Modal>
    </div>
  );
}