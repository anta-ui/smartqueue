"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { ResourceAllocation } from '@/types/ai';

interface ResourceOptimizerProps {
  servicePointIds: string[];
  onSuggestionApply?: (suggestion: ResourceAllocation['suggestions'][0]) => Promise<void>;
}

export function ResourceOptimizer({ servicePointIds, onSuggestionApply }: ResourceOptimizerProps) {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await fetch('/api/ai/resource-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ servicePointIds })
        });
        if (!response.ok) throw new Error('Failed to fetch resource suggestions');
        const data: ResourceAllocation[] = await response.json();
        setAllocations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
    const interval = setInterval(fetchAllocations, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, [servicePointIds]);

  const handleApplySuggestion = async (servicePointId: string, suggestion: ResourceAllocation['suggestions'][0]) => {
    if (!onSuggestionApply) return;
    
    setApplying(servicePointId);
    try {
      await onSuggestionApply(suggestion);
      // Rafraîchir les allocations après l'application
      const response = await fetch('/api/ai/resource-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicePointIds })
      });
      if (!response.ok) throw new Error('Failed to refresh resource suggestions');
      const data: ResourceAllocation[] = await response.json();
      setAllocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <UserGroupIcon className="h-5 w-5 text-blue-500" />
        Optimisation des Ressources
      </h3>

      {allocations.map((allocation) => (
        <Card key={allocation.servicePointId} className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Point de service #{allocation.servicePointId}</h4>
              <p className="text-sm text-gray-500">
                Charge actuelle: {allocation.currentLoad}% | Efficacité: {allocation.efficiency}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {allocation.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  suggestion.priority === 'high'
                    ? 'bg-red-50 border border-red-100'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-50 border border-yellow-100'
                    : 'bg-blue-50 border border-blue-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{suggestion.action}</p>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600">
                        <ArrowTrendingUpIcon className="h-4 w-4 inline mr-1" />
                        -{suggestion.expectedImpact.waitTimeReduction}min d'attente
                      </span>
                      <span className="ml-3 text-blue-600">
                        +{suggestion.expectedImpact.efficiencyGain}% d'efficacité
                      </span>
                    </div>
                  </div>
                  {onSuggestionApply && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplySuggestion(allocation.servicePointId, suggestion)}
                      disabled={!!applying}
                    >
                      {applying === allocation.servicePointId ? 'Application...' : 'Appliquer'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
