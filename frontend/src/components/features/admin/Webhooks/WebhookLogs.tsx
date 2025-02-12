import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useCache } from "@/hooks/cache/useCache";
import { formatDateTime } from "@/lib/utils/date";
import { WebhookDelivery } from "@/types/webhook";
import { WebhookDebugger } from "./WebhookDebugger";

interface WebhookLogsProps {
  organizationId: string;
  webhookId: string;
}

export function WebhookLogs({ organizationId, webhookId }: WebhookLogsProps) {
  const [filters, setFilters] = useState({
    status: "",
    event: "",
    from: "",
    to: "",
    search: "",
  });
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);

  const { data: logs, loading, refresh } = useCache<WebhookDelivery[]>(
    `/api/organizations/${organizationId}/webhooks/${webhookId}/deliveries`,
    {
      params: {
        ...filters,
        page: 1,
        per_page: 20,
      },
    }
  );

  const columns = [
    {
      header: "Événement",
      accessorKey: "event",
      cell: (props: any) => <span className="font-mono">{props.getValue()}</span>,
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (props: any) => {
        const status = props.getValue();
        return (
          <Badge
            variant={
              status === "success"
                ? "success"
                : status === "failure"
                ? "destructive"
                : "default"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Code HTTP",
      accessorKey: "statusCode",
      cell: (props: any) => (
        <span className="font-mono">{props.getValue() || "-"}</span>
      ),
    },
    {
      header: "Durée",
      accessorKey: "duration",
      cell: (props: any) => (
        <span className="font-mono">{props.getValue()}ms</span>
      ),
    },
    {
      header: "Tentatives",
      accessorKey: "attempts",
      cell: (props: any) => (
        <span className="font-mono">{props.getValue().length}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "timestamp",
      cell: (props: any) => (
        <span className="font-mono">{formatDateTime(props.getValue())}</span>
      ),
    },
    {
      id: "actions",
      cell: (props: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDelivery(props.row.original)}
        >
          Détails
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs des Webhooks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger aria-label="Statut">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="failure">Échec</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.event}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, event: value }))
                }
              >
                <SelectTrigger aria-label="Type d'événement">
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  <SelectItem value="user.created">user.created</SelectItem>
                  <SelectItem value="user.updated">user.updated</SelectItem>
                  <SelectItem value="user.deleted">user.deleted</SelectItem>
                  {/* Ajouter d'autres événements selon les besoins */}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <DateTimePicker
                value={filters.from ? new Date(filters.from) : undefined}
                onChange={(date) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: date ? date.toISOString() : "",
                  }))
                }
                placeholder="Date de début"
                aria-label="Date de début"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <DateTimePicker
                value={filters.to ? new Date(filters.to) : undefined}
                onChange={(date) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: date ? date.toISOString() : "",
                  }))
                }
                placeholder="Date de fin"
                aria-label="Date de fin"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                aria-label="Rechercher"
              />
            </div>

            <div>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    status: "",
                    event: "",
                    from: "",
                    to: "",
                    search: "",
                  })
                }
                aria-label="Réinitialiser"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={logs || []}
            loading={loading}
            pagination={{
              pageSize: 20,
              pageIndex: 0,
              pageCount: Math.ceil((logs?.length || 0) / 20),
              onPageChange: () => {}, // À implémenter si nécessaire
            }}
          />
        </div>
      </CardContent>

      {selectedDelivery && (
        <WebhookDebugger
          delivery={selectedDelivery}
          open={!!selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}
    </Card>
  );
}
