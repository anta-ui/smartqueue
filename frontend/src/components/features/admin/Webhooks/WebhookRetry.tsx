import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/useToast";
import { useCache } from "@/hooks/cache/useCache";
import { formatDateTime } from "@/lib/utils/date";
import type { WebhookDelivery } from "@/types/webhook";

interface WebhookRetryProps {
  organizationId: string;
  webhookId: string;
  onSuccess?: () => void;
}

export function WebhookRetry({
  organizationId,
  webhookId,
  onSuccess,
}: WebhookRetryProps) {
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const { data: failedDeliveries, refresh } = useCache<WebhookDelivery[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/deliveries/failed`
  );

  const handleRetry = async () => {
    if (!selectedDeliveries.length) return;

    setIsRetrying(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/retry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deliveryIds: selectedDeliveries }),
        }
      );

      if (!response.ok) throw new Error("Échec du rejeu des webhooks");

      toast({
        title: "Webhooks relancés avec succès",
        description: `${selectedDeliveries.length} livraisons ont été relancées.`,
      });

      setSelectedDeliveries([]);
      refresh();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejeu des webhooks.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const toggleAll = () => {
    if (selectedDeliveries.length === failedDeliveries?.length) {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(failedDeliveries?.map((d) => d.id) || []);
    }
  };

  const toggleDelivery = (deliveryId: string) => {
    setSelectedDeliveries((prev) =>
      prev.includes(deliveryId)
        ? prev.filter((id) => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  if (!failedDeliveries?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune livraison en échec
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedDeliveries.length === failedDeliveries.length &&
              failedDeliveries.length > 0
            }
            onCheckedChange={toggleAll}
          />
          <span className="text-sm text-gray-500">
            {selectedDeliveries.length} sélectionné
            {selectedDeliveries.length > 1 ? "s" : ""}
          </span>
        </div>
        <Button
          onClick={handleRetry}
          disabled={!selectedDeliveries.length || isRetrying}
        >
          Réessayer {selectedDeliveries.length} webhook
          {selectedDeliveries.length > 1 ? "s" : ""}
        </Button>
      </div>

      <div className="space-y-2">
        {failedDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <Checkbox
              checked={selectedDeliveries.includes(delivery.id)}
              onCheckedChange={() => toggleDelivery(delivery.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{delivery.event}</span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(delivery.timestamp)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div>Status: {delivery.statusCode}</div>
                {delivery.attempts.map((attempt, index) => (
                  <div key={index} className="text-xs text-gray-500 mt-1">
                    Tentative {index + 1}: {attempt.status} ({attempt.statusCode})
                    {attempt.error && ` - ${attempt.error}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
