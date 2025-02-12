"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Select } from "@/components/common/Select";
import { Badge } from "@/components/common/Badge";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { WebhookEndpoint, WebhookEventType } from "@/types/webhook";

const webhookSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  url: z.string().url("L'URL doit être valide"),
  description: z.string().optional(),
  events: z.array(z.string()).min(1, "Au moins un événement est requis"),
  metadata: z.object({
    environment: z.enum(["development", "staging", "production"]).optional(),
    retryPolicy: z
      .object({
        maxAttempts: z.number().min(1).max(10),
        backoffRate: z.number().min(1).max(5),
      })
      .optional(),
    timeout: z.number().min(1000).max(30000).optional(),
    headers: z.record(z.string()).optional(),
  }),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface WebhookFormProps {
  webhook?: WebhookEndpoint;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WebhookFormData) => void;
}

const AVAILABLE_EVENTS: WebhookEventType[] = [
  "user.created",
  "user.updated",
  "user.deleted",
  "user.login",
  "user.logout",
  "user.password_reset",
  "organization.created",
  "organization.updated",
  "organization.deleted",
  "billing.invoice.created",
  "billing.invoice.paid",
  "billing.invoice.overdue",
  "billing.subscription.created",
  "billing.subscription.updated",
  "billing.subscription.canceled",
  "api.key.created",
  "api.key.revoked",
  "api.rate_limit.exceeded",
  "api.error.repeated",
];

const WebhookForm = ({
  webhook,
  open,
  onClose,
  onSubmit,
}: WebhookFormProps): JSX.Element => {
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>(
    webhook?.metadata.headers || {}
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: webhook
      ? {
          name: webhook.name,
          url: webhook.url,
          description: webhook.description,
          events: webhook.events,
          metadata: webhook.metadata,
        }
      : {
          name: "",
          url: "",
          description: "",
          events: [],
          metadata: {
            environment: "production",
            retryPolicy: {
              maxAttempts: 3,
              backoffRate: 2,
            },
            timeout: 5000,
            headers: {},
          },
        },
  });

  const selectedEvents = watch("events", []);

  useEffect(() => {
    setValue("metadata.headers", customHeaders);
  }, [customHeaders, setValue]);

  const addCustomHeader = () => {
    setCustomHeaders((prev) => ({
      ...prev,
      [`header-${Object.keys(prev).length + 1}`]: "valeur",
    }));
  };

  const removeCustomHeader = (key: string) => {
    setCustomHeaders((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateCustomHeader = (
    oldKey: string,
    newKey: string,
    value: string
  ) => {
    setCustomHeaders((prev) => {
      const { [oldKey]: oldValue, ...rest } = prev;
      return {
        ...rest,
        [newKey]: value,
      };
    });
  };

  const onFormSubmit = handleSubmit((data) => {
    if (Object.values(customHeaders).some(header => header.trim() === "")) {
      alert("Veuillez remplir tous les en-têtes personnalisés.");
      return;
    }
    data.metadata.headers = customHeaders;
    onSubmit(data);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" description="Formulaire de configuration du webhook">
        <DialogHeader>
          <DialogTitle>
            {webhook ? "Modifier le Webhook" : "Nouveau Webhook"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onFormSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Mon Webhook"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                URL
              </label>
              <Input
                id="url"
                {...register("url")}
                placeholder="https://api.monapp.com/webhooks"
                error={errors.url?.message}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Description optionnelle..."
                rows={2}
                error={errors.description?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Événements
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <Badge
                      key={event}
                      variant={selectedEvents.includes(event) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newEvents = selectedEvents.includes(event)
                          ? selectedEvents.filter((e) => e !== event)
                          : [...selectedEvents, event];
                        setValue("events", newEvents);
                      }}
                      data-testid={`event-${event}`}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
                {errors.events && (
                  <p className="text-sm text-red-500">{errors.events.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="metadata.environment" className="block text-sm font-medium mb-1">
                Environnement
              </label>
              <Select
                id="metadata.environment"
                {...register("metadata.environment")}
              >
                <option value="development">Développement</option>
                <option value="staging">Pré-production</option>
                <option value="production">Production</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="metadata.retryPolicy.maxAttempts" className="block text-sm font-medium mb-1">
                  Tentatives Max
                </label>
                <Input
                  id="metadata.retryPolicy.maxAttempts"
                  type="number"
                  {...register("metadata.retryPolicy.maxAttempts", {
                    valueAsNumber: true,
                  })}
                  min={1}
                  max={10}
                  error={errors.metadata?.retryPolicy?.maxAttempts?.message}
                />
              </div>
              <div>
                <label htmlFor="metadata.retryPolicy.backoffRate" className="block text-sm font-medium mb-1">
                  Taux de Repli
                </label>
                <Input
                  id="metadata.retryPolicy.backoffRate"
                  type="number"
                  {...register("metadata.retryPolicy.backoffRate", {
                    valueAsNumber: true,
                  })}
                  min={1}
                  max={5}
                  step={0.5}
                  error={errors.metadata?.retryPolicy?.backoffRate?.message}
                />
              </div>
            </div>

            <div>
              <label htmlFor="metadata.timeout" className="block text-sm font-medium mb-1">
                Timeout (ms)
              </label>
              <Input
                id="metadata.timeout"
                type="number"
                {...register("metadata.timeout", {
                  valueAsNumber: true,
                })}
                min={1000}
                max={30000}
                step={1000}
                error={errors.metadata?.timeout?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  En-têtes Personnalisés
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomHeader}
                >
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(customHeaders).map(([key, value], index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      id={`custom-header-${index}-key`}
                      placeholder="Nom"
                      value={key}
                      onChange={(e) =>
                        updateCustomHeader(key, e.target.value, value)
                      }
                      className="flex-1"
                    />
                    <Input
                      id={`custom-header-${index}-value`}
                      placeholder="Valeur"
                      value={value}
                      onChange={(e) =>
                        updateCustomHeader(key, key, e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomHeader(key)}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {webhook ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { WebhookForm };
export default WebhookForm;
