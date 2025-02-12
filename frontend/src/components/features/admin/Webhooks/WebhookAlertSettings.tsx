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
import { BellIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface AlertRule {
  id: string;
  type: "error_rate" | "latency" | "volume" | "success_rate";
  condition: "above" | "below";
  threshold: number;
  duration: number;
  channels: ("email" | "slack" | "webhook")[];
  enabled: boolean;
}

interface WebhookAlertSettingsProps {
  organizationId: string;
  webhookId: string;
}

const ALERT_TYPES = {
  error_rate: {
    label: "Taux d'erreur",
    unit: "%",
    defaultThreshold: 5,
  },
  latency: {
    label: "Latence",
    unit: "ms",
    defaultThreshold: 1000,
  },
  volume: {
    label: "Volume de livraisons",
    unit: "req/min",
    defaultThreshold: 100,
  },
  success_rate: {
    label: "Taux de succès",
    unit: "%",
    defaultThreshold: 95,
  },
};

const DURATIONS = [
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 heure" },
];

export function WebhookAlertSettings({
  organizationId,
  webhookId,
}: WebhookAlertSettingsProps) {
  const [open, setOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast } = useToast();

  const { data: rules, refresh } = useCache<AlertRule[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/alert-rules`
  );

  const handleSave = async (rule: AlertRule) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/alert-rules${
          rule.id ? `/${rule.id}` : ""
        }`,
        {
          method: rule.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rule),
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Règle d'alerte sauvegardée",
        description: "La règle d'alerte a été mise à jour avec succès",
      });

      refresh();
      setEditingRule(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/alert-rules/${ruleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error();

      toast({
        title: "Règle d'alerte supprimée",
        description: "La règle d'alerte a été supprimée avec succès",
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

  const handleToggle = async (rule: AlertRule) => {
    await handleSave({
      ...rule,
      enabled: !rule.enabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BellIcon className="h-4 w-4 mr-2" />
          Alertes
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration des Alertes</DialogTitle>
          <DialogDescription>
            Définissez des règles d'alerte personnalisées pour ce webhook
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des règles existantes */}
          <div className="space-y-4">
            {rules?.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggle(rule)}
                    />
                    <div>
                      <p className="font-medium">
                        {ALERT_TYPES[rule.type].label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {rule.condition === "above" ? "Supérieur" : "Inférieur"} à{" "}
                        {rule.threshold}
                        {ALERT_TYPES[rule.type].unit} pendant {rule.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {rule.channels.map((channel) => (
                      <span
                        key={channel}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRule(rule)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
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
                setEditingRule({
                  id: "",
                  type: "error_rate",
                  condition: "above",
                  threshold: ALERT_TYPES.error_rate.defaultThreshold,
                  duration: 5,
                  channels: ["email"],
                  enabled: true,
                })
              }
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle Règle
            </Button>
          </div>

          {/* Modal d'édition de règle */}
          {editingRule && (
            <Dialog
              open={!!editingRule}
              onOpenChange={() => setEditingRule(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRule.id ? "Modifier" : "Nouvelle"} Règle d'Alerte
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type d'Alerte</label>
                    <Select
                      value={editingRule.type}
                      onValueChange={(value: AlertRule["type"]) =>
                        setEditingRule((prev) => ({
                          ...prev!,
                          type: value,
                          threshold: ALERT_TYPES[value].defaultThreshold,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ALERT_TYPES).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Condition</label>
                    <Select
                      value={editingRule.condition}
                      onValueChange={(value: AlertRule["condition"]) =>
                        setEditingRule((prev) => ({
                          ...prev!,
                          condition: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Supérieur à</SelectItem>
                        <SelectItem value="below">Inférieur à</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seuil</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={editingRule.threshold}
                        onChange={(e) =>
                          setEditingRule((prev) => ({
                            ...prev!,
                            threshold: parseFloat(e.target.value),
                          }))
                        }
                      />
                      <span className="text-sm text-gray-500">
                        {ALERT_TYPES[editingRule.type].unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durée</label>
                    <Select
                      value={editingRule.duration.toString()}
                      onValueChange={(value) =>
                        setEditingRule((prev) => ({
                          ...prev!,
                          duration: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((duration) => (
                          <SelectItem
                            key={duration.value}
                            value={duration.value.toString()}
                          >
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Canaux de Notification
                    </label>
                    <div className="space-y-2">
                      {["email", "slack", "webhook"].map((channel) => (
                        <div
                          key={channel}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            checked={editingRule.channels.includes(
                              channel as AlertRule["channels"][number]
                            )}
                            onCheckedChange={(checked) =>
                              setEditingRule((prev) => ({
                                ...prev!,
                                channels: checked
                                  ? [...prev!.channels, channel as AlertRule["channels"][number]]
                                  : prev!.channels.filter((c) => c !== channel),
                              }))
                            }
                          />
                          <label className="text-sm">
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingRule(null)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={() => handleSave(editingRule)}>
                    {editingRule.id ? "Mettre à jour" : "Créer"}
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
