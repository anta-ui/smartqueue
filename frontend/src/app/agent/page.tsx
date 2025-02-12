"use client";

import { useState, useEffect } from "react";
import { AgentDashboard } from "@/components/features/agent/AgentDashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ServicePoint } from "@/types/queue";

export default function AgentPage() {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ServicePoint | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les points de service disponibles
  useEffect(() => {
    const loadServicePoints = async () => {
      try {
        const response = await fetch("/api/agent/service-points");
        const data = await response.json();
        setServicePoints(data);
        
        // Si l'agent n'a qu'un seul point de service, le sélectionner automatiquement
        if (data.length === 1) {
          setSelectedPoint(data[0]);
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les points de service",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadServicePoints();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!selectedPoint) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Sélectionner un point de service</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicePoints.map((point) => (
            <Card
              key={point.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPoint(point)}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{point.name}</h3>
                <p className="text-sm text-gray-500">
                  {point.isVehicleCompatible
                    ? "Compatible véhicules"
                    : "Services standards"}
                </p>
                <Button variant="outline" className="w-full">
                  Sélectionner
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interface Agent</h1>
        {servicePoints.length > 1 && (
          <Button variant="outline" onClick={() => setSelectedPoint(null)}>
            Changer de point de service
          </Button>
        )}
      </div>
      <AgentDashboard servicePoint={selectedPoint} />
    </div>
  );
}
