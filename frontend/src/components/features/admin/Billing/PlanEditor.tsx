"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

interface PlanFeatures {
  [key: string]: Feature[];
}

const INITIAL_FEATURES: PlanFeatures = {
  basic: [
    {
      id: "queues",
      name: "Files d'attente",
      description: "Nombre de files d'attente actives",
      included: true,
      limit: 5,
    },
    {
      id: "users",
      name: "Utilisateurs",
      description: "Nombre d'utilisateurs simultanés",
      included: true,
      limit: 10,
    },
  ],
  pro: [
    {
      id: "queues",
      name: "Files d'attente",
      description: "Nombre de files d'attente actives",
      included: true,
      limit: 20,
    },
    {
      id: "users",
      name: "Utilisateurs",
      description: "Nombre d'utilisateurs simultanés",
      included: true,
      limit: 50,
    },
  ],
  enterprise: [
    {
      id: "queues",
      name: "Files d'attente",
      description: "Nombre de files d'attente actives",
      included: true,
      limit: -1, // Illimité
    },
    {
      id: "users",
      name: "Utilisateurs",
      description: "Nombre d'utilisateurs simultanés",
      included: true,
      limit: -1, // Illimité
    },
  ],
};

export default function PlanEditor() {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [features, setFeatures] = useState<PlanFeatures>(INITIAL_FEATURES);
  const [editMode, setEditMode] = useState(false);

  const handleFeatureToggle = (featureId: string) => {
    setFeatures((prev) => ({
      ...prev,
      [selectedPlan]: prev[selectedPlan].map((feature) =>
        feature.id === featureId
          ? { ...feature, included: !feature.included }
          : feature
      ),
    }));
  };

  const handleLimitChange = (featureId: string, limit: number) => {
    setFeatures((prev) => ({
      ...prev,
      [selectedPlan]: prev[selectedPlan].map((feature) =>
        feature.id === featureId ? { ...feature, limit } : feature
      ),
    }));
  };

  const addFeature = () => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      name: "Nouvelle fonctionnalité",
      description: "Description de la fonctionnalité",
      included: true,
    };

    setFeatures((prev) => ({
      ...prev,
      [selectedPlan]: [...prev[selectedPlan], newFeature],
    }));
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Éditeur de Plans</h2>
          <p className="text-muted-foreground">
            Configurez les fonctionnalités et limites de chaque plan
          </p>
        </div>
        <Button
          variant={editMode ? "default" : "outline"}
          onClick={() => setEditMode(!editMode)}
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          {editMode ? "Terminer" : "Modifier"}
        </Button>
      </div>

      {/* Sélecteur de plan */}
      <div className="flex space-x-4">
        {Object.keys(features).map((plan) => (
          <Button
            key={plan}
            variant={selectedPlan === plan ? "default" : "outline"}
            onClick={() => setSelectedPlan(plan)}
            className="capitalize"
          >
            {plan}
          </Button>
        ))}
      </div>

      {/* Liste des fonctionnalités */}
      <Card className="p-6">
        <div className="space-y-6">
          {features[selectedPlan].map((feature) => (
            <div
              key={feature.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={feature.included}
                    onCheckedChange={() =>
                      editMode && handleFeatureToggle(feature.id)
                    }
                    disabled={!editMode}
                  />
                  <div>
                    <Label className="text-lg">{feature.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>

              {feature.included && feature.limit !== undefined && (
                <div className="flex items-center space-x-2">
                  <Label>Limite:</Label>
                  <Input
                    type="number"
                    value={feature.limit === -1 ? "∞" : feature.limit}
                    onChange={(e) =>
                      editMode &&
                      handleLimitChange(
                        feature.id,
                        e.target.value === "∞" ? -1 : parseInt(e.target.value)
                      )
                    }
                    className="w-24"
                    disabled={!editMode}
                  />
                </div>
              )}

              {editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {editMode && (
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={addFeature}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter une fonctionnalité
          </Button>
        )}
      </Card>
    </div>
  );
}
