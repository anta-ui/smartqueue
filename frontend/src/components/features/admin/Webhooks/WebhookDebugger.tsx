import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/date";
import type { WebhookDelivery } from "@/types/webhook";

interface WebhookDebuggerProps {
  delivery: WebhookDelivery;
  open: boolean;
  onClose: () => void;
}

export default function WebhookDebugger({
  delivery,
  open,
  onClose,
}: WebhookDebuggerProps) {
  const [expandedJson, setExpandedJson] = useState(false);

  const formatJson = (json: string | object) => {
    try {
      const obj = typeof json === "string" ? JSON.parse(json) : json;
      return JSON.stringify(obj, null, expandedJson ? 2 : 0);
    } catch (error) {
      return json;
    }
  };

  const formatHeaders = (headers: Record<string, string>) => {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent description="Détails de la livraison du webhook">
        <DialogHeader>
          <DialogTitle>Détails de la Livraison</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Détails de la livraison du webhook
          </p>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6 p-4">
            {/* En-tête */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-mono">{delivery.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Événement</p>
                <p className="font-mono">{delivery.event}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <Badge
                  variant={
                    delivery.status === "success"
                      ? "success"
                      : delivery.status === "failure"
                      ? "destructive"
                      : "default"
                  }
                  role="status"
                  aria-label={delivery.status}
                >
                  {delivery.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code HTTP</p>
                <p className="font-mono">{delivery.statusCode || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Durée</p>
                <p className="font-mono">{delivery.duration}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-mono">{formatDateTime(delivery.timestamp)}</p>
              </div>
            </div>

            {/* Options de formatage */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedJson(!expandedJson)}
              >
                {expandedJson ? "Compresser JSON" : "Étendre JSON"}
              </Button>
            </div>

            {/* Tentatives */}
            <Accordion type="single" collapsible>
              <AccordionItem value="attempts">
                <AccordionTrigger>
                  Tentatives ({delivery.attempts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {delivery.attempts.map((attempt, index) => (
                      <div
                        key={index}
                        className="border rounded p-4 space-y-2"
                      >
                        <div className="flex justify-between">
                          <Badge
                            variant={
                              attempt.status === "success"
                                ? "success"
                                : "destructive"
                            }
                            role="status"
                            aria-label={attempt.status}
                          >
                            {attempt.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(attempt.timestamp)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Code HTTP:</span>{" "}
                            {attempt.statusCode}
                          </div>
                          <div>
                            <span className="text-gray-500">Durée:</span>{" "}
                            {attempt.duration}ms
                          </div>
                        </div>
                        {attempt.error && (
                          <div className="text-sm text-red-500">
                            {attempt.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Requête */}
              <AccordionItem value="request">
                <AccordionTrigger>Requête</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">URL</p>
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {delivery.request.url}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Méthode</p>
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {delivery.request.method}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500">En-têtes</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              formatHeaders(delivery.request.headers)
                            )
                          }
                        >
                          Copier
                        </Button>
                      </div>
                      <pre className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap text-sm">
                        {formatHeaders(delivery.request.headers)}
                      </pre>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500">Corps</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(formatJson(delivery.request.body))
                          }
                        >
                          Copier
                        </Button>
                      </div>
                      <pre className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap text-sm">
                        {formatJson(delivery.request.body)}
                      </pre>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Réponse */}
              {delivery.response && (
                <AccordionItem value="response">
                  <AccordionTrigger>Réponse</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Code HTTP</p>
                        <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {delivery.response.statusCode}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-gray-500">En-têtes</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                formatHeaders(delivery.response.headers)
                              )
                            }
                          >
                            Copier
                          </Button>
                        </div>
                        <pre className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap text-sm">
                          {formatHeaders(delivery.response.headers)}
                        </pre>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-gray-500">Corps</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(formatJson(delivery.response.body))
                            }
                          >
                            Copier
                          </Button>
                        </div>
                        <pre className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap text-sm">
                          {formatJson(delivery.response.body)}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
