import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { useCache } from "@/hooks/cache/useCache";
import {
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Integration {
  id: string;
  type: "datadog" | "newrelic" | "grafana" | "prometheus" | "cloudwatch";
  name: string;
  enabled: boolean;
  config: {
    apiKey?: string;
    endpoint?: string;
    region?: string;
    namespace?: string;
    labels?: Record<string, string>;
    customFields?: Record<string, string>;
  };
  metrics: string[];
}

interface WebhookIntegrationsProps {
  organizationId: string;
  webhookId: string;
}

const INTEGRATION_TYPES = {
  datadog: {
    label: "Datadog",
    description: "Envoyez vos métriques vers Datadog",
    fields: ["apiKey", "endpoint"],
    icon: "/icons/datadog.svg",
  },
  newrelic: {
    label: "New Relic",
    description: "Intégrez vos données avec New Relic",
    fields: ["apiKey", "endpoint"],
    icon: "/icons/newrelic.svg",
  },
  grafana: {
    label: "Grafana Cloud",
    description: "Visualisez vos métriques dans Grafana",
    fields: ["apiKey", "endpoint"],
    icon: "/icons/grafana.svg",
  },
  prometheus: {
    label: "Prometheus",
    description: "Exposez vos métriques au format Prometheus",
    fields: ["endpoint", "labels"],
    icon: "/icons/prometheus.svg",
  },
  cloudwatch: {
    label: "AWS CloudWatch",
    description: "Envoyez vos métriques vers CloudWatch",
    fields: ["apiKey", "region", "namespace"],
    icon: "/icons/cloudwatch.svg",
  },
};

const AVAILABLE_METRICS = [
  { id: "success_rate", label: "Taux de succès" },
  { id: "error_rate", label: "Taux d'erreur" },
  { id: "latency", label: "Latence" },
  { id: "volume", label: "Volume" },
  { id: "retry_count", label: "Nombre de rejeux" },
  { id: "p95_latency", label: "Latence P95" },
  { id: "p99_latency", label: "Latence P99" },
];

export function WebhookIntegrations({
  organizationId,
  webhookId,
}: WebhookIntegrationsProps) {
  const [open, setOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(
    null
  );
  const { toast } = useToast();

  const { data: integrations, refresh } = useCache<Integration[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/integrations`
  );

  const handleSave = async (integration: Integration) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/integrations${
          integration.id ? `/${integration.id}` : ""
        }`,
        {
          method: integration.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(integration),
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Intégration sauvegardée",
        description: "L'intégration a été configurée avec succès",
      });

      refresh();
      setEditingIntegration(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/integrations/${integrationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Intégration supprimée",
        description: "L'intégration a été supprimée avec succès",
      });

      refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (integration: Integration) => {
    await handleSave({
      ...integration,
      enabled: !integration.enabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
          Intégrations
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Intégrations</DialogTitle>
          <DialogDescription>
            Connectez vos webhooks à vos outils de monitoring préférés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des intégrations existantes */}
          <div className="space-y-4">
            {integrations?.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => handleToggle(integration)}
                    />
                    <img
                      src={INTEGRATION_TYPES[integration.type].icon}
                      alt={integration.type}
                      className="h-8 w-8"
                    />
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-gray-500">
                        {INTEGRATION_TYPES[integration.type].description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {integration.metrics.map((metric) => (
                        <span
                          key={metric}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {
                            AVAILABLE_METRICS.find((m) => m.id === metric)
                              ?.label
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIntegration(integration)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setEditingIntegration({
                  id: "",
                  type: "datadog",
                  name: "",
                  enabled: true,
                  config: {},
                  metrics: ["success_rate", "error_rate", "latency"],
                })
              }
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle Intégration
            </Button>
          </div>

          {/* Modal d'édition d'intégration */}
          {editingIntegration && (
            <Dialog
              open={!!editingIntegration}
              onOpenChange={() => setEditingIntegration(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingIntegration.id ? "Modifier" : "Nouvelle"} Intégration
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(INTEGRATION_TYPES).map(
                        ([key, { label, icon }]) => (
                          <button
                            key={key}
                            className={`flex items-center space-x-3 p-3 rounded-lg border ${
                              editingIntegration.type === key
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setEditingIntegration((prev) => ({
                                ...prev!,
                                type: key as Integration["type"],
                                config: {},
                              }))
                            }
                          >
                            <img src={icon} alt={label} className="h-6 w-6" />
                            <span className="font-medium">{label}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={editingIntegration.name}
                      onChange={(e) =>
                        setEditingIntegration((prev) => ({
                          ...prev!,
                          name: e.target.value,
                        }))
                      }
                      placeholder={`${
                        INTEGRATION_TYPES[editingIntegration.type].label
                      } Integration`}
                    />
                  </div>

                  {INTEGRATION_TYPES[editingIntegration.type].fields.map(
                    (field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-sm font-medium">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        {field === "labels" ? (
                          <div className="space-y-2">
                            {Object.entries(
                              editingIntegration.config.labels || {}
                            ).map(([key, value], index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  placeholder="Clé"
                                  value={key}
                                  onChange={(e) =>
                                    setEditingIntegration((prev) => ({
                                      ...prev!,
                                      config: {
                                        ...prev!.config,
                                        labels: {
                                          ...prev!.config.labels,
                                          [e.target.value]:
                                            prev!.config.labels?.[key] || "",
                                        },
                                      },
                                    }))
                                  }
                                />
                                <Input
                                  placeholder="Valeur"
                                  value={value}
                                  onChange={(e) =>
                                    setEditingIntegration((prev) => ({
                                      ...prev!,
                                      config: {
                                        ...prev!.config,
                                        labels: {
                                          ...prev!.config.labels,
                                          [key]: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingIntegration((prev) => {
                                      const newLabels = { ...prev!.config.labels };
                                      delete newLabels[key];
                                      return {
                                        ...prev!,
                                        config: {
                                          ...prev!.config,
                                          labels: newLabels,
                                        },
                                      };
                                    })
                                  }
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditingIntegration((prev) => ({
                                  ...prev!,
                                  config: {
                                    ...prev!.config,
                                    labels: {
                                      ...prev!.config.labels,
                                      "": "",
                                    },
                                  },
                                }))
                              }
                            >
                              Ajouter un label
                            </Button>
                          </div>
                        ) : (
                          <Input
                            value={editingIntegration.config[field] || ""}
                            onChange={(e) =>
                              setEditingIntegration((prev) => ({
                                ...prev!,
                                config: {
                                  ...prev!.config,
                                  [field]: e.target.value,
                                },
                              }))
                            }
                            type={field === "apiKey" ? "password" : "text"}
                          />
                        )}
                      </div>
                    )
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Métriques</label>
                    <div className="space-y-2">
                      {AVAILABLE_METRICS.map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            checked={editingIntegration.metrics.includes(
                              metric.id
                            )}
                            onCheckedChange={(checked) =>
                              setEditingIntegration((prev) => ({
                                ...prev!,
                                metrics: checked
                                  ? [...prev!.metrics, metric.id]
                                  : prev!.metrics.filter((m) => m !== metric.id),
                              }))
                            }
                          />
                          <label className="text-sm">{metric.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingIntegration(null)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={() => handleSave(editingIntegration)}>
                    {editingIntegration.id ? "Mettre à jour" : "Créer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
