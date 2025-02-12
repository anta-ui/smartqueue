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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import type { GDPRRequest, DataProcessingRecord } from "@/types/security";

export default function GDPRManagement() {
  const [selectedRequest, setSelectedRequest] = useState<GDPRRequest | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<DataProcessingRecord | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests, loading: requestsLoading, refresh: refreshRequests } =
    useCache<GDPRRequest[]>({
      key: "gdpr_requests",
      fetchData: async () => {
        const response = await fetch("/api/admin/security/gdpr/requests");
        return response.json();
      },
    });

  const { data: records, loading: recordsLoading, refresh: refreshRecords } =
    useCache<DataProcessingRecord[]>({
      key: "data_processing_records",
      fetchData: async () => {
        const response = await fetch("/api/admin/security/gdpr/processing");
        return response.json();
      },
    });

  const handleRequestUpdate = async (
    requestId: string,
    data: Partial<GDPRRequest>
  ) => {
    try {
      const response = await fetch(
        `/api/admin/security/gdpr/requests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        refreshRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Failed to update request:", error);
    }
  };

  const handleRecordSubmit = async (record: Partial<DataProcessingRecord>) => {
    try {
      const response = await fetch(
        `/api/admin/security/gdpr/processing${
          record.id ? `/${record.id}` : ""
        }`,
        {
          method: record.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        }
      );

      if (response.ok) {
        refreshRecords();
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Failed to save record:", error);
    }
  };

  const filteredRequests = requests?.filter((request) =>
    statusFilter === "all" ? true : request.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">
            <UserIcon className="h-5 w-5 mr-2" />
            Demandes RGPD
          </TabsTrigger>
          <TabsTrigger value="processing">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Registre des Traitements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Demandes RGPD</h2>
                  <p className="text-sm text-gray-500">
                    Gérez les demandes d'accès et de suppression
                  </p>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {requestsLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date Limite</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests?.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.requestDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge>{request.type}</Badge>
                        </TableCell>
                        <TableCell>{request.userEmail}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "completed"
                                ? "success"
                                : request.status === "rejected"
                                ? "destructive"
                                : request.status === "processing"
                                ? "warning"
                                : "default"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Gérer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Registre des Traitements
                  </h2>
                  <p className="text-sm text-gray-500">
                    Documentez vos traitements de données personnelles
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedRecord({} as DataProcessingRecord)}
                >
                  Nouveau Traitement
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {recordsLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finalité</TableHead>
                      <TableHead>Catégories de Données</TableHead>
                      <TableHead>Base Légale</TableHead>
                      <TableHead>Durée de Conservation</TableHead>
                      <TableHead>Dernière Revue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records?.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.purpose}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.dataCategories.map((category) => (
                              <Badge key={category} variant="outline">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{record.legalBasis}</TableCell>
                        <TableCell>{record.retentionPeriod}</TableCell>
                        <TableCell>
                          {new Date(record.lastReview).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedRecord(record)}
                          >
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Demande RGPD */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gérer la Demande RGPD</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date de Demande</label>
                  <p className="mt-1">
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Limite</label>
                  <p className="mt-1">
                    {new Date(selectedRequest.dueDate).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <p className="mt-1">
                  {selectedRequest.userEmail} ({selectedRequest.userId})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Catégories de Données</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedRequest.dataCategories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) =>
                    handleRequestUpdate(selectedRequest.id, {
                      status: value as GDPRRequest["status"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full mt-1 border rounded-md"
                  rows={3}
                  value={selectedRequest.notes}
                  onChange={(e) =>
                    handleRequestUpdate(selectedRequest.id, {
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Traitement */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord?.id
                ? "Modifier le Traitement"
                : "Nouveau Traitement"}
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleRecordSubmit({
                  ...selectedRecord,
                  purpose: formData.get("purpose") as string,
                  dataCategories: (formData.get("dataCategories") as string).split(
                    ","
                  ),
                  recipients: (formData.get("recipients") as string).split(","),
                  retentionPeriod: formData.get("retentionPeriod") as string,
                  legalBasis: formData.get("legalBasis") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Finalité</label>
                <Input
                  name="purpose"
                  defaultValue={selectedRecord.purpose}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Catégories de Données
                </label>
                <Input
                  name="dataCategories"
                  defaultValue={selectedRecord.dataCategories?.join(",")}
                  placeholder="nom,email,adresse"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Destinataires</label>
                <Input
                  name="recipients"
                  defaultValue={selectedRecord.recipients?.join(",")}
                  placeholder="service_client,comptabilite"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Durée de Conservation
                </label>
                <Input
                  name="retentionPeriod"
                  defaultValue={selectedRecord.retentionPeriod}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Base Légale</label>
                <select
                  name="legalBasis"
                  className="w-full mt-1 border rounded-md"
                  defaultValue={selectedRecord.legalBasis}
                  required
                >
                  <option value="consent">Consentement</option>
                  <option value="contract">Contrat</option>
                  <option value="legal_obligation">Obligation Légale</option>
                  <option value="vital_interests">Intérêts Vitaux</option>
                  <option value="public_interest">Intérêt Public</option>
                  <option value="legitimate_interests">
                    Intérêts Légitimes
                  </option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
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
