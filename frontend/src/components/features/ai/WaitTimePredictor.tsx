"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  ChartBarIcon,
  SunIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import type { WaitTimePredictor } from '@/types/ai';

interface WaitTimePredictorProps {
  queueId: string;
  onPredictionChange?: (prediction: WaitTimePredictor['prediction']) => void;
}

export function WaitTimePredictorView({ queueId, onPredictionChange }: WaitTimePredictorProps) {
  const [prediction, setPrediction] = useState<WaitTimePredictor['prediction'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch(`/api/ai/predictions/wait-time/${queueId}`);
        if (!response.ok) throw new Error('Failed to fetch prediction');
        const data: WaitTimePredictor = await response.json();
        setPrediction(data.prediction);
        onPredictionChange?.(data.prediction);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [queueId, onPredictionChange]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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

  if (!prediction) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          Temps d'attente estimé
        </h3>
        <Badge
          variant="outline"
          className={`px-2 py-1 ${getConfidenceColor(prediction.confidence)}`}
        >
          {Math.round(prediction.confidence * 100)}% de confiance
        </Badge>
      </div>

      <div className="text-3xl font-bold text-center py-4">
        {formatWaitTime(prediction.estimatedWaitTime)}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500">Facteurs d'influence</h4>
        {prediction.factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm">{factor.factor}</span>
            <Progress
              value={Math.abs(factor.impact) * 100}
              className={`w-32 ${factor.impact > 0 ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
