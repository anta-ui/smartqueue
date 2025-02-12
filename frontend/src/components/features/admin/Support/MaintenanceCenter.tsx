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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  type: "update" | "backup" | "maintenance";
  services: string[];
  rollbackPlan: string;
}

interface BackupConfig {
  id: string;
  name: string;
  type: "full" | "incremental";
  schedule: string;
  retention: number;
  lastRun?: string;
  status: "success" | "failed" | "running";
  size?: number;
}

export default function MaintenanceCenter() {
  const [selectedWindow, setSelectedWindow] = useState<MaintenanceWindow | null>(
    null
  );
  const [selectedBackup, setSelectedBackup] = useState<BackupConfig | null>(
    null
  );

  const {
    data: maintenanceWindows,
    loading: maintenanceLoading,
    refresh: refreshMaintenance,
  } = useCache<MaintenanceWindow[]>({
    key: "maintenance_windows",
    fetchData: async () => {
      const response = await fetch("/api/admin/maintenance/windows");
      return response.json();
    },
  });

  const {
    data: backupConfigs,
    loading: backupLoading,
    refresh: refreshBackups,
  } = useCache<BackupConfig[]>({
    key: "backup_configs",
    fetchData: async () => {
      const response = await fetch("/api/admin/maintenance/backups");
      return response.json();
    },
  });

  const handleMaintenanceSubmit = async (
    window: Partial<MaintenanceWindow>
  ) => {
    try {
      const response = await fetch("/api/admin/maintenance/windows", {
        method: selectedWindow ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(window),
      });

      if (response.ok) {
        refreshMaintenance();
        setSelectedWindow(null);
      }
    } catch (error) {
      console.error("Failed to save maintenance window:", error);
    }
  };

  const handleBackupSubmit = async (config: Partial<BackupConfig>) => {
    try {
      const response = await fetch("/api/admin/maintenance/backups", {
        method: selectedBackup ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        refreshBackups();
        setSelectedBackup(null);
      }
    } catch (error) {
      console.error("Failed to save backup config:", error);
    }
  };

  const triggerBackup = async (configId: string) => {
    try {
      const response = await fetch(
        `/api/admin/maintenance/backups/${configId}/trigger`,
        { method: "POST" }
      );

      if (response.ok) {
        refreshBackups();
      }
    } catch (error) {
      console.error("Failed to trigger backup:", error);
    }
  };

  const restoreBackup = async (configId: string, timestamp: string) => {
    if (!confirm("Are you sure you want to restore this backup?")) return;

    try {
      const response = await fetch(
        `/api/admin/maintenance/backups/${configId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp }),
        }
      );

      if (response.ok) {
        alert("Restoration started successfully!");
      }
    } catch (error) {
      console.error("Failed to restore backup:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Centre de Maintenance</h2>
          <p className="text-sm text-gray-500">
            Gérez les fenêtres de maintenance et les sauvegardes
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="maintenance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="maintenance">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="backups">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Sauvegardes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="maintenance">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setSelectedWindow({} as MaintenanceWindow)}
                  >
                    Planifier une Maintenance
                  </Button>
                </div>

                {maintenanceLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceWindows?.map((window) => (
                        <TableRow key={window.id}>
                          <TableCell>{window.title}</TableCell>
                          <TableCell>
                            <Badge>{window.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(window.startDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(window.endDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                window.status === "completed"
                                  ? "success"
                                  : window.status === "cancelled"
                                  ? "destructive"
                                  : window.status === "in_progress"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {window.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {window.services.map((service) => (
                                <Badge key={service} variant="outline">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedWindow(window)}
                            >
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="backups">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button onClick={() => setSelectedBackup({} as BackupConfig)}>
                    Nouvelle Configuration
                  </Button>
                </div>

                {backupLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Planning</TableHead>
                        <TableHead>Rétention</TableHead>
                        <TableHead>Dernière Exécution</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupConfigs?.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>{config.name}</TableCell>
                          <TableCell>
                            <Badge>{config.type}</Badge>
                          </TableCell>
                          <TableCell>{config.schedule}</TableCell>
                          <TableCell>{config.retention} jours</TableCell>
                          <TableCell>
                            {config.lastRun
                              ? new Date(config.lastRun).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                config.status === "success"
                                  ? "success"
                                  : config.status === "failed"
                                  ? "destructive"
                                  : "warning"
                              }
                            >
                              {config.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => setSelectedBackup(config)}
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => triggerBackup(config.id)}
                              >
                                <CloudArrowUpIcon className="h-4 w-4" />
                              </Button>
                              {config.lastRun && (
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    restoreBackup(config.id, config.lastRun!)
                                  }
                                >
                                  <ArrowUturnLeftIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Maintenance */}
      <Dialog
        open={!!selectedWindow}
        onOpenChange={() => setSelectedWindow(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWindow?.id
                ? "Modifier la Maintenance"
                : "Nouvelle Maintenance"}
            </DialogTitle>
          </DialogHeader>

          {selectedWindow && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleMaintenanceSubmit({
                  ...selectedWindow,
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  startDate: formData.get("startDate") as string,
                  endDate: formData.get("endDate") as string,
                  type: formData.get("type") as MaintenanceWindow["type"],
                  services: (formData.get("services") as string).split(","),
                  rollbackPlan: formData.get("rollbackPlan") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  name="title"
                  defaultValue={selectedWindow.title}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  className="w-full mt-1 border rounded-md"
                  rows={3}
                  defaultValue={selectedWindow.description}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date de Début</label>
                  <Input
                    name="startDate"
                    type="datetime-local"
                    defaultValue={selectedWindow.startDate}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Date de Fin</label>
                  <Input
                    name="endDate"
                    type="datetime-local"
                    defaultValue={selectedWindow.endDate}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  className="w-full mt-1 border rounded-md"
                  defaultValue={selectedWindow.type}
                  required
                >
                  <option value="update">Mise à jour</option>
                  <option value="backup">Sauvegarde</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Services Affectés</label>
                <Input
                  name="services"
                  defaultValue={selectedWindow.services?.join(",")}
                  placeholder="api,web,database"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Plan de Rollback</label>
                <textarea
                  name="rollbackPlan"
                  className="w-full mt-1 border rounded-md"
                  rows={3}
                  defaultValue={selectedWindow.rollbackPlan}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedWindow(null)}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Backup */}
      <Dialog
        open={!!selectedBackup}
        onOpenChange={() => setSelectedBackup(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBackup?.id
                ? "Modifier la Configuration"
                : "Nouvelle Configuration"}
            </DialogTitle>
          </DialogHeader>

          {selectedBackup && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleBackupSubmit({
                  ...selectedBackup,
                  name: formData.get("name") as string,
                  type: formData.get("type") as BackupConfig["type"],
                  schedule: formData.get("schedule") as string,
                  retention: Number(formData.get("retention")),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  name="name"
                  defaultValue={selectedBackup.name}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  className="w-full mt-1 border rounded-md"
                  defaultValue={selectedBackup.type}
                  required
                >
                  <option value="full">Complète</option>
                  <option value="incremental">Incrémentale</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Planning (Cron)</label>
                <Input
                  name="schedule"
                  defaultValue={selectedBackup.schedule}
                  placeholder="0 0 * * *"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Rétention (en jours)
                </label>
                <Input
                  name="retention"
                  type="number"
                  defaultValue={selectedBackup.retention}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBackup(null)}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
