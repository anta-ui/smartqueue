// src/components/queue/QueueManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { queueService } from '@/services/queueService';
import { QueueForm } from './QueueForm';
import { Button } from '@/components/ui/button';
import {Modal} from '@/components/ui/modal';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {QueueCreateUpdateData, Queue} from '@/types/queue'
export function QueueManagement() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queueTypes, setQueueTypes] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueData, queueTypeData] = await Promise.all([
        queueService.getQueues(),
        queueService.getQueueTypes()
      ]);
      setQueues(queueData);
      setQueueTypes(queueTypeData);
    } catch (err) {
      setError('Impossible de charger les files d\'attente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQueue = async (data: QueueCreateUpdateData) => {
    try {
      const newQueue = await queueService.createQueue(data);
      setQueues([...queues, newQueue]);
      setIsModalOpen(false);
    } catch (error) {
      setError('Échec de la création de la file d\'attente');
    }
  };

  const handleUpdateQueue = async (id: string, data: QueueCreateUpdateData) => {
    try {
      const updatedQueue = await queueService.updateQueue(id, data);
      setQueues(queues.map(q => q.id === id ? updatedQueue : q));
      setIsModalOpen(false);
    } catch (error) {
      setError('Échec de la mise à jour de la file d\'attente');
    }
  };

  const handleDeleteQueue = async (id: string) => {
    try {
      await queueService.deleteQueue(id);
      setQueues(queues.filter(q => q.id !== id));
    } catch (error) {
      setError('Échec de la suppression de la file d\'attente');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gestion des Files d'Attente</h1>
        <Button onClick={() => {
          setSelectedQueue(null);
          setIsModalOpen(true);
        }}>
          Nouvelle File d'Attente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queues.map(queue => (
          <Card key={queue.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{queue.name}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Statut : {queue.status}</p>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedQueue(queue);
                      setIsModalOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteQueue(queue.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
        >
          <QueueForm
            queue={selectedQueue}
            queueTypes={queueTypes}
            onSubmit={selectedQueue 
              ? (data) => handleUpdateQueue(selectedQueue.id, data)
              : handleCreateQueue
            }
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}