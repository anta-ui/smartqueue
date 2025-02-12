"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCache } from "@/hooks/cache/useCache";
import { formatDate } from "@/lib/utils/date";
import type { WebhookDelivery } from "@/types/webhook";

interface WebhookDeliveriesProps {
  organizationId: string;
  webhookId: string;
  open: boolean;
  onClose: () => void;
}

interface DeliveryDetailsProps {
  delivery: WebhookDelivery;
}

function DeliveryDetails({ delivery }: DeliveryDetailsProps) {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="request">
          <AccordionTrigger>Requête</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">URL</div>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                  {delivery.request.url}
                </code>
              </div>
              <div>
                <div className="text-sm font-medium">En-têtes</div>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {JSON.stringify(delivery.request.headers, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-sm font-medium">Corps</div>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(JSON.parse(delivery.request.body), null, 2)}
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {delivery.response && (
          <AccordionItem value="response">
            <AccordionTrigger>Réponse</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Code Status</div>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {delivery.response.statusCode}
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium">En-têtes</div>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {JSON.stringify(delivery.response.headers, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-sm font-medium">Corps</div>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-64">
                    {delivery.response.body}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {delivery.attempts.length > 1 && (
          <AccordionItem value="attempts">
            <AccordionTrigger>Tentatives ({delivery.attempts.length})</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {delivery.attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      attempt.status === "success"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            attempt.status === "success"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {attempt.status}
                        </Badge>
                        <span className="text-sm">
                          {formatDate(attempt.timestamp)}
                        </span>
                      </div>
                      <span className="text-sm">
                        {attempt.duration}ms
                      </span>
                    </div>
                    {attempt.error && (
                      <div className="mt-2 text-sm text-red-600">
                        {attempt.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}

export default function WebhookDeliveries({
  organizationId,
  webhookId,
  open,
  onClose,
}: WebhookDeliveriesProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery>();

  const { data: deliveries, loading } = useCache<WebhookDelivery[]>({
    key: `webhook_${webhookId}_deliveries`,
    fetchData: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/deliveries`
      );
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des livraisons");
      }
      return response.json();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent description="Détails des livraisons de webhooks">
        <DialogHeader>
          <DialogTitle>Livraisons du Webhook</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Liste des livraisons du webhook
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Tentatives</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries?.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <Badge variant="outline">{delivery.event}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delivery.status === "success"
                            ? "success"
                            : delivery.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(delivery.timestamp)}
                    </TableCell>
                    <TableCell>{delivery.duration}ms</TableCell>
                    <TableCell>
                      {delivery.attempts.length > 1 && (
                        <Badge variant="secondary">
                          {delivery.attempts.length} tentatives
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {selectedDelivery && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Détails de la Livraison
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDelivery(undefined)}
                    >
                      Fermer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DeliveryDetails delivery={selectedDelivery} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
