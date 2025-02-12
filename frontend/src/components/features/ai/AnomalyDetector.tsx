"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { QueueAnomaly } from '@/types/ai';

interface AnomalyDetectorProps {
  queueId: string;
  onAnomalyDetected?: (anomaly: QueueAnomaly) => void;
  onAnomalyResolved?: (anomalyId: string) => void;
}

export function AnomalyDetector({
  queueId,
  onAnomalyDetected,
  onAnomalyResolved
}: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useState<QueueAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const response = await fetch(`/api/ai/anomalies/${queueId}`);
        if (!response.ok) throw new Error('Failed to fetch anomalies');
        const data: QueueAnomaly[] = await response.json();
        setAnomalies(data);
        
        // Notifier les nouvelles anomalies
        const newAnomalies = data.filter(
          anomaly => anomaly.status === 'detected'
        );
        newAnomalies.forEach(anomaly => onAnomalyDetected?.(anomaly));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
    // Vérifier les anomalies toutes les minutes
    const interval = setInterval(fetchAnomalies, 60 * 1000);
    return () => clearInterval(interval);
  }, [queueId, onAnomalyDetected]);

  const handleInvestigate = async (anomalyId: string) => {
    try {
      const response = await fetch(`/api/ai/anomalies/${anomalyId}/investigate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to start investigation');
      const updatedAnomaly: QueueAnomaly = await response.json();
      setAnomalies(prev =>
        prev.map(a => (a.id === anomalyId ? updatedAnomaly : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to investigate anomaly');
    }
  };

  const handleResolve = async (anomalyId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/ai/anomalies/${anomalyId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });
      if (!response.ok) throw new Error('Failed to resolve anomaly');
      const updatedAnomaly: QueueAnomaly = await response.json();
      setAnomalies(prev =>
        prev.map(a => (a.id === anomalyId ? updatedAnomaly : a))
      );
      onAnomalyResolved?.(anomalyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve anomaly');
    }
  };

  const getSeverityColor = (severity: QueueAnomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: QueueAnomaly['status']) => {
    switch (status) {
      case 'detected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'investigating':
        return <MagnifyingGlassIcon className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'false_positive':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <p className="text-red-600">Error: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
        Détection d'Anomalies
      </h3>

      {anomalies.length === 0 ? (
        <Card className="p-4 text-center text-gray-500">
          Aucune anomalie détectée
        </Card>
      ) : (
        anomalies.map((anomaly) => (
          <Card key={anomaly.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(anomaly.status)}
                <h4 className="font-medium">{anomaly.type}</h4>
                <Badge
                  variant="outline"
                  className={`ml-2 ${getSeverityColor(anomaly.severity)}`}
                >
                  {anomaly.severity}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(anomaly.detectedAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm">{anomaly.description}</p>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium mb-2">Métriques</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Observé</p>
                  <p className="font-medium">{anomaly.metrics.observed}</p>
                </div>
                <div>
                  <p className="text-gray-500">Attendu</p>
                  <p className="font-medium">{anomaly.metrics.expected}</p>
                </div>
                <div>
                  <p className="text-gray-500">Écart</p>
                  <p className="font-medium">{anomaly.metrics.deviation}%</p>
                </div>
              </div>
            </div>

            {anomaly.status === 'detected' && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleInvestigate(anomaly.id)}
                >
                  Investiguer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(anomaly.id, 'false_positive')}
                >
                  Faux Positif
                </Button>
              </div>
            )}

            {anomaly.resolution && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="text-sm font-medium text-green-700 mb-1">
                  Résolution
                </h5>
                <p className="text-sm text-green-600">{anomaly.resolution.action}</p>
                <div className="mt-2 text-xs text-green-500">
                  Efficacité: {anomaly.resolution.effectivenessScore}%
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
