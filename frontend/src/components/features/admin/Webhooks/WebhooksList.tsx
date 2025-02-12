"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Switch } from "@/components/common/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/DropdownMenu";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { WebhookEndpoint } from "@/types/webhook";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface WebhooksListProps {
  webhooks: WebhookEndpoint[];
  onEdit: (webhook: WebhookEndpoint) => void;
  onDelete: (webhook: WebhookEndpoint) => void;
  onToggle: (webhook: WebhookEndpoint, active: boolean) => void;
  onViewDeliveries: (webhook: WebhookEndpoint) => void;
  onViewMonitoring: (webhook: WebhookEndpoint) => void;
}

export function WebhooksList({
  webhooks,
  onEdit,
  onDelete,
  onToggle,
  onViewDeliveries,
  onViewMonitoring,
}: WebhooksListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Webhooks Configurés</h2>
            <p className="text-sm text-gray-500">
              Gérez vos points de terminaison webhook et leurs configurations
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Taux de Succès</TableHead>
              <TableHead>Dernière Livraison</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => {
              const successRate =
                webhook.stats.totalDeliveries > 0
                  ? (webhook.stats.successfulDeliveries /
                      webhook.stats.totalDeliveries) *
                    100
                  : 0;

              return (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{webhook.name}</div>
                      <div className="text-sm text-gray-500">
                        {webhook.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {webhook.url}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map((event) => (
                        <Badge key={event} variant="secondary">
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="secondary">
                          +{webhook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={webhook.active}
                      onCheckedChange={(checked) => onToggle(webhook, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-16 rounded-full overflow-hidden bg-gray-200`}
                      >
                        <div
                          className={`h-full ${
                            successRate >= 90
                              ? "bg-green-500"
                              : successRate >= 75
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {webhook.stats.lastDelivery ? (
                      <div>
                        <div
                          className={`text-sm ${
                            webhook.stats.lastDelivery.status === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {webhook.stats.lastDelivery.status === "success"
                            ? "Succès"
                            : "Échec"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(
                            webhook.stats.lastDelivery.timestamp
                          ).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Aucune livraison
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewMonitoring(webhook)}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Monitoring
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDeliveries(webhook)}
                      >
                        Livraisons
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(webhook)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(webhook)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
