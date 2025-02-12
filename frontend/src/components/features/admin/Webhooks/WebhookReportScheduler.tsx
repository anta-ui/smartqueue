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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { useCache } from "@/hooks/cache/useCache";
import { ClockIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ReportSchedule {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  format: "pdf" | "csv" | "json";
  metrics: string[];
  recipients: string[];
  enabled: boolean;
  time: string;
  weekDay?: number;
  monthDay?: number;
}

interface WebhookReportSchedulerProps {
  organizationId: string;
  webhookId: string;
}

const FREQUENCIES = {
  daily: {
    label: "Quotidien",
    description: "Envoyé chaque jour à l'heure spécifiée",
  },
  weekly: {
    label: "Hebdomadaire",
    description: "Envoyé chaque semaine le jour spécifié",
  },
  monthly: {
    label: "Mensuel",
    description: "Envoyé chaque mois le jour spécifié",
  },
};

const AVAILABLE_METRICS = [
  { id: "success_rate", label: "Taux de succès" },
  { id: "error_rate", label: "Taux d'erreur" },
  { id: "latency", label: "Latence" },
  { id: "volume", label: "Volume" },
  { id: "top_errors", label: "Erreurs principales" },
  { id: "retry_stats", label: "Statistiques de rejeu" },
];

export function WebhookReportScheduler({
  organizationId,
  webhookId,
}: WebhookReportSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(
    null
  );
  const { toast } = useToast();

  const { data: schedules, refresh } = useCache<ReportSchedule[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/report-schedules`
  );

  const handleSave = async (schedule: ReportSchedule) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/report-schedules${
          schedule.id ? `/${schedule.id}` : ""
        }`,
        {
          method: schedule.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(schedule),
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Planification sauvegardée",
        description: "Le rapport automatique a été configuré avec succès",
      });

      refresh();
      setEditingSchedule(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/report-schedules/${scheduleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Planification supprimée",
        description: "Le rapport automatique a été supprimé avec succès",
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

  const handleToggle = async (schedule: ReportSchedule) => {
    await handleSave({
      ...schedule,
      enabled: !schedule.enabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ClockIcon className="h-4 w-4 mr-2" />
          Rapports Automatiques
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rapports Automatiques</DialogTitle>
          <DialogDescription>
            Planifiez l'envoi automatique de rapports de performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des planifications existantes */}
          <div className="space-y-4">
            {schedules?.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => handleToggle(schedule)}
                    />
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-gray-500">
                        {FREQUENCIES[schedule.frequency].label} - {schedule.time}
                        {schedule.weekDay !== undefined &&
                          ` - Jour ${schedule.weekDay + 1}`}
                        {schedule.monthDay !== undefined &&
                          ` - Jour ${schedule.monthDay + 1}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {schedule.metrics.map((metric) => (
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
                    <div className="mt-1 text-sm text-gray-500">
                      {schedule.recipients.join(", ")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSchedule(schedule)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
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
                setEditingSchedule({
                  id: "",
                  name: "",
                  frequency: "daily",
                  format: "pdf",
                  metrics: ["success_rate", "error_rate"],
                  recipients: [],
                  enabled: true,
                  time: "09:00",
                })
              }
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle Planification
            </Button>
          </div>

          {/* Modal d'édition de planification */}
          {editingSchedule && (
            <Dialog
              open={!!editingSchedule}
              onOpenChange={() => setEditingSchedule(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule.id ? "Modifier" : "Nouvelle"} Planification
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={editingSchedule.name}
                      onChange={(e) =>
                        setEditingSchedule((prev) => ({
                          ...prev!,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Rapport quotidien de performance"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fréquence</label>
                    <Select
                      value={editingSchedule.frequency}
                      onValueChange={(value: ReportSchedule["frequency"]) =>
                        setEditingSchedule((prev) => ({
                          ...prev!,
                          frequency: value,
                          weekDay:
                            value === "weekly" ? prev!.weekDay ?? 0 : undefined,
                          monthDay:
                            value === "monthly" ? prev!.monthDay ?? 1 : undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQUENCIES).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Heure d'envoi</label>
                    <Input
                      type="time"
                      value={editingSchedule.time}
                      onChange={(e) =>
                        setEditingSchedule((prev) => ({
                          ...prev!,
                          time: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {editingSchedule.frequency === "weekly" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jour de la semaine</label>
                      <Select
                        value={editingSchedule.weekDay?.toString()}
                        onValueChange={(value) =>
                          setEditingSchedule((prev) => ({
                            ...prev!,
                            weekDay: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Lundi",
                            "Mardi",
                            "Mercredi",
                            "Jeudi",
                            "Vendredi",
                            "Samedi",
                            "Dimanche",
                          ].map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {editingSchedule.frequency === "monthly" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jour du mois</label>
                      <Select
                        value={editingSchedule.monthDay?.toString()}
                        onValueChange={(value) =>
                          setEditingSchedule((prev) => ({
                            ...prev!,
                            monthDay: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              Jour {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select
                      value={editingSchedule.format}
                      onValueChange={(value: ReportSchedule["format"]) =>
                        setEditingSchedule((prev) => ({
                          ...prev!,
                          format: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Métriques</label>
                    <div className="space-y-2">
                      {AVAILABLE_METRICS.map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            checked={editingSchedule.metrics.includes(metric.id)}
                            onCheckedChange={(checked) =>
                              setEditingSchedule((prev) => ({
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destinataires</label>
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      value={editingSchedule.recipients.join(", ")}
                      onChange={(e) =>
                        setEditingSchedule((prev) => ({
                          ...prev!,
                          recipients: e.target.value
                            .split(",")
                            .map((email) => email.trim())
                            .filter(Boolean),
                        }))
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSchedule(null)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={() => handleSave(editingSchedule)}>
                    {editingSchedule.id ? "Mettre à jour" : "Créer"}
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
