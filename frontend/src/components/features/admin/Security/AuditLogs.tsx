"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { AuditLog } from "@/types/security";

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const { data: logs, loading } = useCache<AuditLog[]>({
    key: "audit_logs",
    fetchData: async () => {
      const response = await fetch("/api/admin/security/audit");
      return response.json();
    },
  });

  const filteredLogs = logs?.filter((log) => {
    if (severity !== "all" && log.severity !== severity) return false;
    if (dateRange.start && new Date(log.timestamp) < new Date(dateRange.start))
      return false;
    if (dateRange.end && new Date(log.timestamp) > new Date(dateRange.end))
      return false;
    if (
      search &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.resource.toLowerCase().includes(search.toLowerCase()) &&
      !log.userId.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Logs d'Audit</h2>
        <p className="text-sm text-gray-500">
          Consultez l'historique des actions et des événements
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={severity}
              onValueChange={(value) => setSeverity(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-[180px]"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-[180px]"
            />
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Sévérité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      {log.resource} ({log.resourceId})
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.severity === "critical"
                            ? "destructive"
                            : log.severity === "warning"
                            ? "warning"
                            : "default"
                        }
                      >
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === "success" ? "success" : "destructive"}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du Log</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="mt-1">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Utilisateur</label>
                  <p className="mt-1">{selectedLog.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP</label>
                  <p className="mt-1">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="mt-1">{selectedLog.userAgent}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Détails</label>
                <pre className="mt-1 p-4 bg-gray-100 rounded-md overflow-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
