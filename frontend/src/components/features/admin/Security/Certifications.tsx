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
  CheckBadgeIcon,
  DocumentArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Certification } from "@/types/security";

export default function Certifications() {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: certifications, loading, refresh } = useCache<Certification[]>({
    key: "certifications",
    fetchData: async () => {
      const response = await fetch("/api/admin/security/certifications");
      return response.json();
    },
  });

  const handleCertSubmit = async (cert: Partial<Certification>) => {
    try {
      const response = await fetch(
        `/api/admin/security/certifications${cert.id ? `/${cert.id}` : ""}`,
        {
          method: cert.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cert),
        }
      );

      if (response.ok) {
        refresh();
        setSelectedCert(null);
      }
    } catch (error) {
      console.error("Failed to save certification:", error);
    }
  };

  const handleDocumentUpload = async (certId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `/api/admin/security/certifications/${certId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleDocumentDelete = async (certId: string, docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(
        `/api/admin/security/certifications/${certId}/documents/${docId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const filteredCertifications = certifications?.filter((cert) =>
    statusFilter === "all" ? true : cert.status === statusFilter
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Certifications</h2>
            <p className="text-sm text-gray-500">
              Gérez les certifications et leur conformité
            </p>
          </div>
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="preparation">Préparation</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="obtained">Obtenue</SelectItem>
                <SelectItem value="expired">Expirée</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setSelectedCert({} as Certification)}>
              Nouvelle Certification
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'Obtention</TableHead>
                <TableHead>Date d'Expiration</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertifications?.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.provider}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        cert.status === "obtained"
                          ? "success"
                          : cert.status === "expired"
                          ? "destructive"
                          : cert.status === "in_progress"
                          ? "warning"
                          : "default"
                      }
                    >
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cert.obtainedDate
                      ? new Date(cert.obtainedDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {cert.expiryDate
                      ? new Date(cert.expiryDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {cert.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedCert(cert)}
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

      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCert?.id
                ? "Modifier la Certification"
                : "Nouvelle Certification"}
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleCertSubmit({
                  ...selectedCert,
                  name: formData.get("name") as string,
                  provider: formData.get("provider") as string,
                  status: formData.get("status") as Certification["status"],
                  obtainedDate: formData.get("obtainedDate") as string,
                  expiryDate: formData.get("expiryDate") as string,
                  scope: (formData.get("scope") as string).split(","),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  name="name"
                  defaultValue={selectedCert.name}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fournisseur</label>
                <Input
                  name="provider"
                  defaultValue={selectedCert.provider}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="status"
                  className="w-full mt-1 border rounded-md"
                  defaultValue={selectedCert.status}
                  required
                >
                  <option value="preparation">Préparation</option>
                  <option value="in_progress">En cours</option>
                  <option value="obtained">Obtenue</option>
                  <option value="expired">Expirée</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date d'Obtention</label>
                  <Input
                    name="obtainedDate"
                    type="date"
                    defaultValue={selectedCert.obtainedDate}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Date d'Expiration</label>
                  <Input
                    name="expiryDate"
                    type="date"
                    defaultValue={selectedCert.expiryDate}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Périmètre</label>
                <Input
                  name="scope"
                  defaultValue={selectedCert.scope?.join(",")}
                  placeholder="api,web,database"
                />
              </div>

              {selectedCert.id && (
                <>
                  <div>
                    <label className="text-sm font-medium">Exigences</label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCert.requirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>{req.description}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  req.status === "compliant"
                                    ? "success"
                                    : req.status === "non_compliant"
                                    ? "destructive"
                                    : "warning"
                                }
                              >
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{req.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Documents</label>
                    <div className="mt-2 space-y-2">
                      {selectedCert.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between"
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {doc.name}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDocumentDelete(selectedCert.id, doc.id)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDocumentUpload(selectedCert.id, file);
                            }
                          }}
                        />
                        <Button variant="outline">
                          <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCert(null)}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
