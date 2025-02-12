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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { useCache } from "@/hooks/cache/useCache";
import {
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface DashboardWidget {
  id: string;
  type: "line" | "bar" | "pie" | "number" | "table";
  title: string;
  metric: string;
  timeRange: "1h" | "24h" | "7d" | "30d" | "custom";
  customTimeRange?: {
    start: string;
    end: string;
  };
  refreshInterval: number;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: {
    aggregation?: "sum" | "avg" | "min" | "max";
    groupBy?: string[];
    filters?: Array<{
      field: string;
      operator: "eq" | "neq" | "gt" | "lt" | "contains";
      value: string;
    }>;
    displayOptions?: {
      showLegend?: boolean;
      stackBars?: boolean;
      colorScheme?: string;
    };
  };
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

interface WebhookCustomDashboardProps {
  organizationId: string;
  webhookId: string;
}

const WIDGET_TYPES = {
  line: {
    label: "Graphique en ligne",
    description: "Visualisez l'évolution dans le temps",
    icon: ChartBarIcon,
  },
  bar: {
    label: "Graphique en barres",
    description: "Comparez des valeurs",
    icon: ChartBarIcon,
  },
  pie: {
    label: "Graphique circulaire",
    description: "Affichez des proportions",
    icon: ChartBarIcon,
  },
  number: {
    label: "Métrique simple",
    description: "Affichez une valeur clé",
    icon: ChartBarIcon,
  },
  table: {
    label: "Tableau",
    description: "Listez les données détaillées",
    icon: ViewColumnsIcon,
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

export function WebhookCustomDashboard({
  organizationId,
  webhookId,
}: WebhookCustomDashboardProps) {
  const [open, setOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const { toast } = useToast();

  const { data: dashboards, refresh } = useCache<Dashboard[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/dashboards`
  );

  const handleSaveDashboard = async (dashboard: Dashboard) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/dashboards${
          dashboard.id ? `/${dashboard.id}` : ""
        }`,
        {
          method: dashboard.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dashboard),
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Tableau de bord sauvegardé",
        description: "Le tableau de bord a été configuré avec succès",
      });

      refresh();
      setEditingDashboard(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/dashboards/${dashboardId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Tableau de bord supprimé",
        description: "Le tableau de bord a été supprimé avec succès",
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

  const handleSaveWidget = async (
    dashboard: Dashboard,
    widget: DashboardWidget
  ) => {
    const updatedDashboard = {
      ...dashboard,
      widgets: widget.id
        ? dashboard.widgets.map((w) => (w.id === widget.id ? widget : w))
        : [...dashboard.widgets, { ...widget, id: crypto.randomUUID() }],
    };

    await handleSaveDashboard(updatedDashboard);
    setEditingWidget(null);
  };

  const handleDeleteWidget = async (
    dashboard: Dashboard,
    widgetId: string
  ) => {
    const updatedDashboard = {
      ...dashboard,
      widgets: dashboard.widgets.filter((w) => w.id !== widgetId),
    };

    await handleSaveDashboard(updatedDashboard);
  };

  const handleDragEnd = async (
    dashboard: Dashboard,
    result: any
  ) => {
    if (!result.destination) return;

    const items = Array.from(dashboard.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedDashboard = {
      ...dashboard,
      widgets: items,
    };

    await handleSaveDashboard(updatedDashboard);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ViewColumnsIcon className="h-4 w-4 mr-2" />
          Tableaux de Bord
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tableaux de Bord Personnalisés</DialogTitle>
          <DialogDescription>
            Créez et personnalisez vos tableaux de bord de monitoring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des tableaux de bord */}
          <div className="space-y-4">
            {dashboards?.map((dashboard) => (
              <div
                key={dashboard.id}
                className="space-y-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-gray-500">
                        {dashboard.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDashboard(dashboard)}
                    >
                      Modifier
                    </Button>
                    {!dashboard.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Liste des widgets */}
                <DragDropContext
                  onDragEnd={(result) => handleDragEnd(dashboard, result)}
                >
                  <Droppable droppableId={dashboard.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2"
                      >
                        {dashboard.widgets.map((widget, index) => (
                          <Draggable
                            key={widget.id}
                            draggableId={widget.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between p-3 bg-white rounded border"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded ${
                                      widget.type === "line"
                                        ? "bg-blue-100 text-blue-700"
                                        : widget.type === "bar"
                                        ? "bg-green-100 text-green-700"
                                        : widget.type === "pie"
                                        ? "bg-purple-100 text-purple-700"
                                        : widget.type === "number"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {WIDGET_TYPES[widget.type].icon && (
                                      <WIDGET_TYPES[widget.type].icon className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{widget.title}</p>
                                    <p className="text-sm text-gray-500">
                                      {
                                        AVAILABLE_METRICS.find(
                                          (m) => m.id === widget.metric
                                        )?.label
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingWidget(widget)}
                                  >
                                    Modifier
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteWidget(dashboard, widget.id)
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setEditingWidget({
                      id: "",
                      type: "line",
                      title: "",
                      metric: "success_rate",
                      timeRange: "24h",
                      refreshInterval: 300,
                      position: { x: 0, y: 0, w: 6, h: 4 },
                      config: {},
                    })
                  }
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un widget
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setEditingDashboard({
                  id: "",
                  name: "",
                  layout: "grid",
                  widgets: [],
                  isDefault: false,
                })
              }
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau Tableau de Bord
            </Button>
          </div>
        </div>

        {/* Modal d'édition de tableau de bord */}
        {editingDashboard && (
          <Dialog
            open={!!editingDashboard}
            onOpenChange={() => setEditingDashboard(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDashboard.id ? "Modifier" : "Nouveau"} Tableau de Bord
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={editingDashboard.name}
                    onChange={(e) =>
                      setEditingDashboard((prev) => ({
                        ...prev!,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Tableau de bord principal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editingDashboard.description}
                    onChange={(e) =>
                      setEditingDashboard((prev) => ({
                        ...prev!,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Vue d'ensemble des performances"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Layout</label>
                  <Select
                    value={editingDashboard.layout}
                    onValueChange={(value) =>
                      setEditingDashboard((prev) => ({
                        ...prev!,
                        layout: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grille</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingDashboard(null)}
                >
                  Annuler
                </Button>
                <Button onClick={() => handleSaveDashboard(editingDashboard)}>
                  {editingDashboard.id ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal d'édition de widget */}
        {editingWidget && (
          <Dialog
            open={!!editingWidget}
            onOpenChange={() => setEditingWidget(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWidget.id ? "Modifier" : "Nouveau"} Widget
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(WIDGET_TYPES).map(([key, { label, icon: Icon }]) => (
                      <button
                        key={key}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          editingWidget.type === key
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          setEditingWidget((prev) => ({
                            ...prev!,
                            type: key as DashboardWidget["type"],
                          }))
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input
                    value={editingWidget.title}
                    onChange={(e) =>
                      setEditingWidget((prev) => ({
                        ...prev!,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Taux de succès sur 24h"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Métrique</label>
                  <Select
                    value={editingWidget.metric}
                    onValueChange={(value) =>
                      setEditingWidget((prev) => ({
                        ...prev!,
                        metric: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_METRICS.map((metric) => (
                        <SelectItem key={metric.id} value={metric.id}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Période</label>
                  <Select
                    value={editingWidget.timeRange}
                    onValueChange={(value: DashboardWidget["timeRange"]) =>
                      setEditingWidget((prev) => ({
                        ...prev!,
                        timeRange: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Dernière heure</SelectItem>
                      <SelectItem value="24h">24 heures</SelectItem>
                      <SelectItem value="7d">7 jours</SelectItem>
                      <SelectItem value="30d">30 jours</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingWidget.timeRange === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Début</label>
                      <Input
                        type="datetime-local"
                        value={editingWidget.customTimeRange?.start}
                        onChange={(e) =>
                          setEditingWidget((prev) => ({
                            ...prev!,
                            customTimeRange: {
                              ...prev!.customTimeRange,
                              start: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fin</label>
                      <Input
                        type="datetime-local"
                        value={editingWidget.customTimeRange?.end}
                        onChange={(e) =>
                          setEditingWidget((prev) => ({
                            ...prev!,
                            customTimeRange: {
                              ...prev!.customTimeRange,
                              end: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Intervalle de rafraîchissement (secondes)
                  </label>
                  <Input
                    type="number"
                    min="5"
                    value={editingWidget.refreshInterval}
                    onChange={(e) =>
                      setEditingWidget((prev) => ({
                        ...prev!,
                        refreshInterval: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Taille</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Largeur</label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={editingWidget.position.w}
                        onChange={(e) =>
                          setEditingWidget((prev) => ({
                            ...prev!,
                            position: {
                              ...prev!.position,
                              w: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Hauteur</label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={editingWidget.position.h}
                        onChange={(e) =>
                          setEditingWidget((prev) => ({
                            ...prev!,
                            position: {
                              ...prev!.position,
                              h: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {(editingWidget.type === "line" ||
                  editingWidget.type === "bar") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Options d'affichage
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingWidget.config.displayOptions?.showLegend}
                          onCheckedChange={(checked) =>
                            setEditingWidget((prev) => ({
                              ...prev!,
                              config: {
                                ...prev!.config,
                                displayOptions: {
                                  ...prev!.config.displayOptions,
                                  showLegend: checked,
                                },
                              },
                            }))
                          }
                        />
                        <label className="text-sm">Afficher la légende</label>
                      </div>
                      {editingWidget.type === "bar" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={
                              editingWidget.config.displayOptions?.stackBars
                            }
                            onCheckedChange={(checked) =>
                              setEditingWidget((prev) => ({
                                ...prev!,
                                config: {
                                  ...prev!.config,
                                  displayOptions: {
                                    ...prev!.config.displayOptions,
                                    stackBars: checked,
                                  },
                                },
                              }))
                            }
                          />
                          <label className="text-sm">Empiler les barres</label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {editingWidget.type === "table" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Colonnes</label>
                    <div className="space-y-2">
                      {Object.entries(
                        editingWidget.config.filters || {}
                      ).map(([field, filter], index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Champ"
                            value={field}
                            onChange={(e) =>
                              setEditingWidget((prev) => {
                                const newFilters = { ...prev!.config.filters };
                                delete newFilters[field];
                                return {
                                  ...prev!,
                                  config: {
                                    ...prev!.config,
                                    filters: {
                                      ...newFilters,
                                      [e.target.value]: filter,
                                    },
                                  },
                                };
                              })
                            }
                          />
                          <Select
                            value={filter.operator}
                            onValueChange={(value) =>
                              setEditingWidget((prev) => ({
                                ...prev!,
                                config: {
                                  ...prev!.config,
                                  filters: {
                                    ...prev!.config.filters,
                                    [field]: {
                                      ...filter,
                                      operator: value as any,
                                    },
                                  },
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eq">=</SelectItem>
                              <SelectItem value="neq">≠</SelectItem>
                              <SelectItem value="gt">&gt;</SelectItem>
                              <SelectItem value="lt">&lt;</SelectItem>
                              <SelectItem value="contains">Contient</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Valeur"
                            value={filter.value}
                            onChange={(e) =>
                              setEditingWidget((prev) => ({
                                ...prev!,
                                config: {
                                  ...prev!.config,
                                  filters: {
                                    ...prev!.config.filters,
                                    [field]: {
                                      ...filter,
                                      value: e.target.value,
                                    },
                                  },
                                },
                              }))
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingWidget((prev) => {
                                const newFilters = { ...prev!.config.filters };
                                delete newFilters[field];
                                return {
                                  ...prev!,
                                  config: {
                                    ...prev!.config,
                                    filters: newFilters,
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
                          setEditingWidget((prev) => ({
                            ...prev!,
                            config: {
                              ...prev!.config,
                              filters: {
                                ...prev!.config.filters,
                                "": {
                                  operator: "eq",
                                  value: "",
                                },
                              },
                            },
                          }))
                        }
                      >
                        Ajouter un filtre
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingWidget(null)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() =>
                    handleSaveWidget(editingDashboard!, editingWidget)
                  }
                >
                  {editingWidget.id ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
