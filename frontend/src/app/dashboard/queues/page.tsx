'use client';

import { useEffect, useState } from 'react';
import { queueService } from '@/services/queueService';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { QueueDetailView } from '@/components/queues/QueueDetailView';
import type { Queue, QueueStatus } from '@/types/queue';

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadQueues();
    }
  }, [mounted]);

  const loadQueues = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await queueService.getQueues();
      if (Array.isArray(data)) {
        setQueues(data);
      } else {
        setError('Format de données invalide');
      }
    } catch (err) {
      console.error('Error loading queues:', err);
      setError('Échec du chargement des files d\'attente');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (queueId: string, status: QueueStatus) => {
    try {
      await queueService.updateQueueStatus(queueId, status);
      loadQueues();
    } catch (err) {
      setError('Échec de la mise à jour du statut');
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadQueues} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestion des Files d'Attente
        </h1>
        <Button onClick={() => setSelectedQueue({} as Queue)}>
          Nouvelle File d'Attente
        </Button>
      </div>

      {queues.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune file d'attente disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((queue) => (
            <Card
              key={queue.id}
              onClick={() => setSelectedQueue(queue)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{queue.name}</h3>
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    queue.status === 'AC' ? 'bg-green-100 text-green-800' :
                    queue.status === 'PA' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {queue.status === 'AC' ? 'Actif' :
                     queue.status === 'PA' ? 'En pause' :
                     'Fermé'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Numéro Actuel</span>
                    <span className="text-xl font-semibold">
                      {queue.current_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Temps d'Attente</span>
                    <span>{queue.current_wait_time} min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(queue.id.toString(), 'PA');
                      }}
                      disabled={queue.status === 'PA'}
                    >
                      Pause
                    </Button>
                    <Button
                      variant={queue.status === 'AC' ? 'danger' : 'primary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          queue.id.toString(),
                          queue.status === 'AC' ? 'CL' : 'AC'
                        );
                      }}
                    >
                      {queue.status === 'AC' ? 'Fermer' : 'Activer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedQueue && (
        <Modal
          isOpen={!!selectedQueue}
          onClose={() => setSelectedQueue(null)}
          className="max-w-4xl"
        >
          <QueueDetailView
            queue={selectedQueue}
            onStatusChange={(status) => handleStatusChange(selectedQueue.id.toString(), status)}
            onClose={() => setSelectedQueue(null)}
          />
        </Modal>
      )}
    </div>
  );
}