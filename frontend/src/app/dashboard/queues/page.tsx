'use client';

import { useEffect, useState } from 'react';
import { queueService } from '@/services/queueService';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import { Button, ButtonProps } from '@/components/common/Button';
import { Modal, ModalProps } from '@/components/common/Modal';
import { QueueDetailView, QueueDetailViewProps } from '@/components/queues/QueueDetailView';

// Définition explicite du type QueueStatus
type QueueStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

// Définition des classes de statut
const STATUS_CLASSES: Record<QueueStatus, string> = {
  'ACTIVE': 'bg-green-100 text-green-800',
  'PAUSED': 'bg-yellow-100 text-yellow-800',
  'CLOSED': 'bg-red-100 text-red-800'
};

const STATUS_LABELS: Record<QueueStatus, string> = {
  'ACTIVE': 'Actif',
  'PAUSED': 'En pause',
  'CLOSED': 'Fermé'
};

// Interface de la file d'attente
interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  currentNumber: number;
  currentWaitTime: number;
}

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [stats, setStats] = useState({
    totalQueues: 0,
    activeQueues: 0,
    pausedQueues: 0,
    averageWaitTime: 0
  });

  // Chargement initial des files d'attente
  useEffect(() => {
    loadQueues();
  }, []);

  // Chargement des files d'attente
  const loadQueues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queueService.getQueues();
      
      // Validation et traitement des données
      if (Array.isArray(data)) {
        setQueues(data);
        calculateStats(data);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des files d\'attente:', err);
      setError('Impossible de charger les files d\'attente');
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques
  const calculateStats = (queueData: Queue[]) => {
    const totalQueues = queueData.length;
    const activeQueues = queueData.filter(q => q.status === 'ACTIVE').length;
    const pausedQueues = queueData.filter(q => q.status === 'PAUSED').length;
    const averageWaitTime = totalQueues > 0 
      ? queueData.reduce((sum, q) => sum + q.currentWaitTime, 0) / totalQueues
      : 0;

    setStats({
      totalQueues,
      activeQueues,
      pausedQueues,
      averageWaitTime: Math.round(averageWaitTime)
    });
  };

  // Gestion du changement de statut
  const handleStatusChange = async (queueId: string, status: QueueStatus) => {
    try {
      await queueService.updateQueueStatus(queueId, status);
      await loadQueues(); // Rechargement pour mise à jour
    } catch (err) {
      setError('Impossible de mettre à jour le statut de la file d\'attente');
    }
  };

  // Rendu de la barre de statut
  const renderQueueStatusBadge = (status: QueueStatus) => (
    <span className={`px-2 py-1 text-sm rounded-full ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );

  // Rendu des statistiques globales
  const renderGlobalStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Files</p>
            <p className="text-2xl font-bold">{stats.totalQueues}</p>
          </div>
          <i className="ri-list-check text-blue-500 text-3xl"></i>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Files Actives</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeQueues}</p>
          </div>
          <i className="ri-play-line text-green-500 text-3xl"></i>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Files en Pause</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pausedQueues}</p>
          </div>
          <i className="ri-pause-line text-yellow-500 text-3xl"></i>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Temps Attente Moyen</p>
            <p className="text-2xl font-bold text-blue-600">{stats.averageWaitTime} min</p>
          </div>
          <i className="ri-time-line text-blue-500 text-3xl"></i>
        </CardContent>
      </Card>
    </div>
  );

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="destructive" onClick={loadQueues}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestion des Files d'Attente
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setSelectedQueue({} as Queue)}
        >
          Nouvelle File d'Attente
        </Button>
      </div>

      {/* Statistiques globales */}
      {renderGlobalStats()}

      {/* Liste des files d'attente */}
      {queues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune file d'attente disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((queue) => (
            <Card
              key={queue.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedQueue(queue)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium truncate">{queue.name}</h3>
                  {renderQueueStatusBadge(queue.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Numéro Actuel</span>
                    <span className="text-xl font-semibold">
                      {queue.currentNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Temps d'Attente</span>
                    <span className="font-medium">
                      {queue.currentWaitTime} min
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(queue.id, 'PAUSED');
                      }}
                      disabled={queue.status === 'PAUSED'}
                    >
                      Pause
                    </Button>
                    <Button
                      variant={queue.status === 'ACTIVE' ? 'destructive' : 'primary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          queue.id, 
                          queue.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
                        );
                      }}
                    >
                      {queue.status === 'ACTIVE' ? 'Fermer' : 'Activer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de détail de file d'attente */}
      {selectedQueue && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQueue(null)}
        >
          <QueueDetailView
            queue={selectedQueue}
            onStatusChange={(status: QueueStatus) => handleStatusChange(selectedQueue.id, status)}
            onClose={() => setSelectedQueue(null)}
          />
        </Modal>
      )}
    </div>
  );
}