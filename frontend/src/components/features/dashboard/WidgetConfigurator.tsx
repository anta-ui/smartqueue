"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WidgetConfig } from "@/types/dashboard";

interface WidgetConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: WidgetConfig) => void;
  initialConfig?: WidgetConfig;
}

export function WidgetConfigurator({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}: WidgetConfiguratorProps) {
  const [config, setConfig] = useState<Partial<WidgetConfig>>(
    initialConfig ?? {
      type: "metric",
      size: "small",
      position: { x: 0, y: 0 },
      settings: {},
    }
  );

  const handleSave = () => {
    if (
      !config.id ||
      !config.type ||
      !config.title ||
      !config.size ||
      !config.position ||
      !config.settings ||
      !config.settings.dataSource
    ) {
      // Afficher une erreur
      return;
    }

    onSave(config as WidgetConfig);
    onClose();
  };

  const renderDataSourceConfig = () => {
    switch (config.type) {
      case "metric":
        return (
          <div className="space-y-4">
            <div>
              <Label>Source de données</Label>
              <Input
                value={config.settings?.dataSource ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      dataSource: e.target.value,
                    },
                  })
                }
                placeholder="/api/metrics/active-users"
              />
            </div>
            <div>
              <Label>Intervalle de rafraîchissement (ms)</Label>
              <Input
                type="number"
                value={config.settings?.refreshInterval ?? 30000}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      refreshInterval: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        );

      case "chart":
        return (
          <div className="space-y-4">
            <div>
              <Label>Source de données</Label>
              <Input
                value={config.settings?.dataSource ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      dataSource: e.target.value,
                    },
                  })
                }
                placeholder="/api/metrics/time-series"
              />
            </div>
            <div>
              <Label>Type de graphique</Label>
              <Select
                value={config.settings?.chartType}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      chartType: value as any,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Ligne</SelectItem>
                  <SelectItem value="bar">Barres</SelectItem>
                  <SelectItem value="area">Aires</SelectItem>
                  <SelectItem value="pie">Camembert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Période</Label>
              <Select
                value={config.settings?.timeRange}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      timeRange: value as any,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 heure</SelectItem>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Métriques</Label>
              <div className="space-y-2">
                {(config.settings?.metrics ?? []).map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={metric}
                      onChange={(e) => {
                        const newMetrics = [...(config.settings?.metrics ?? [])];
                        newMetrics[index] = e.target.value;
                        setConfig({
                          ...config,
                          settings: {
                            ...config.settings,
                            metrics: newMetrics,
                          },
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const newMetrics = [...(config.settings?.metrics ?? [])];
                        newMetrics.splice(index, 1);
                        setConfig({
                          ...config,
                          settings: {
                            ...config.settings,
                            metrics: newMetrics,
                          },
                        });
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfig({
                      ...config,
                      settings: {
                        ...config.settings,
                        metrics: [...(config.settings?.metrics ?? []), ""],
                      },
                    })
                  }
                >
                  Ajouter une métrique
                </Button>
              </div>
            </div>
          </div>
        );

      case "status":
      case "map":
        return (
          <div className="space-y-4">
            <div>
              <Label>Source de données</Label>
              <Input
                value={config.settings?.dataSource ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      dataSource: e.target.value,
                    },
                  })
                }
                placeholder="/api/system/resources"
              />
            </div>
            <div>
              <Label>Intervalle de rafraîchissement (ms)</Label>
              <Input
                type="number"
                value={config.settings?.refreshInterval ?? 5000}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: {
                      ...config.settings,
                      refreshInterval: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialConfig ? "Modifier le widget" : "Nouveau widget"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration de base */}
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={config.title ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
                placeholder="Mon widget"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={config.type}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    type: value as WidgetConfig["type"],
                    settings: {}, // Réinitialiser les paramètres lors du changement de type
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrique</SelectItem>
                  <SelectItem value="chart">Graphique</SelectItem>
                  <SelectItem value="status">Ressources</SelectItem>
                  <SelectItem value="map">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Taille</Label>
              <Select
                value={config.size}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    size: value as WidgetConfig["size"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petite</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration spécifique au type */}
          {renderDataSourceConfig()}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
