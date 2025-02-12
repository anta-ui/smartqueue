"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface LegalDocument {
  id: string;
  type: "contract" | "terms" | "privacy" | "dpa" | "other";
  name: string;
  version: string;
  status: "draft" | "active" | "archived";
  signedAt?: string;
  signedBy?: {
    name: string;
    email: string;
    role: string;
  };
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface LegalDocumentsProps {
  organizationId: string;
}

export function LegalDocuments({ organizationId }: LegalDocumentsProps) {
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: documents, loading, refresh } = useCache<LegalDocument[]>({
    key: `organization_${organizationId}_documents`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${organizationId}/documents`);
      return response.json();
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedDocument?.type || "other");
      formData.append("name", selectedDocument?.name || file.name);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/organizations/${organizationId}/documents/upload`);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          refresh();
          setIsAddingDocument(false);
          setSelectedDocument(null);
          setUploadProgress(0);
        }
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      await fetch(`/api/admin/organizations/${organizationId}/documents/${documentId}`, {
        method: "DELETE",
      });
      refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const documentTypes = [
    { value: "contract", label: "Contract" },
    { value: "terms", label: "Terms of Service" },
    { value: "privacy", label: "Privacy Policy" },
    { value: "dpa", label: "Data Processing Agreement" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Legal Documents</h2>
        <Button onClick={() => setIsAddingDocument(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Document
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : documents?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentIcon className="h-12 w-12 mx-auto mb-4" />
            <p>No documents yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.name}</TableCell>
                  <TableCell>
                    {documentTypes.find((t) => t.value === document.type)?.label}
                  </TableCell>
                  <TableCell>{document.version}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        document.status === "active"
                          ? "bg-green-100 text-green-800"
                          : document.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {document.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.url, "_blank")}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentDelete(document.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={isAddingDocument || !!selectedDocument}
        onOpenChange={() => {
          setIsAddingDocument(false);
          setSelectedDocument(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDocument ? "Edit Document" : "Add New Document"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <select
                className="w-full mt-1"
                value={selectedDocument?.type || "other"}
                onChange={(e) =>
                  setSelectedDocument((prev) =>
                    prev ? { ...prev, type: e.target.value as any } : null
                  )
                }
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={selectedDocument?.name || ""}
                onChange={(e) =>
                  setSelectedDocument((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>

            <div>
              <Label>Version</Label>
              <Input
                value={selectedDocument?.version || ""}
                onChange={(e) =>
                  setSelectedDocument((prev) =>
                    prev ? { ...prev, version: e.target.value } : null
                  )
                }
              />
            </div>

            <div>
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-blue-600 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
