"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { SecurityPolicy } from "@/types/security";

export default function SecurityPolicies() {
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(
    null
  );
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: policies, loading, refresh } = useCache<SecurityPolicy[]>({
    key: "security_policies",
    fetchData: async () => {
      const response = await fetch("/api/admin/security/policies");
      return response.json();
    },
  });

  const handlePolicySubmit = async (policy: Partial<SecurityPolicy>) => {
    try {
      const response = await fetch(
        `/api/admin/security/policies${policy.id ? `/${policy.id}` : ""}`,
        {
          method: policy.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(policy),
        }
      );

      if (response.ok) {
        refresh();
        setSelectedPolicy(null);
      }
    } catch (error) {
      console.error("Failed to save policy:", error);
    }
  };

  const handlePolicyDelete = async (policyId: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      const response = await fetch(
        `/api/admin/security/policies/${policyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to delete policy:", error);
    }
  };

  const handlePolicyToggle = async (policyId: string, enabled: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/security/policies/${policyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      );

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to toggle policy:", error);
    }
  };

  const filteredPolicies = policies?.filter((policy) =>
    typeFilter === "all" ? true : policy.type === typeFilter
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Politiques de Sécurité</h2>
            <p className="text-sm text-gray-500">
              Gérez les politiques de sécurité du système
            </p>
          </div>
          <div className="flex gap-4">
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de politique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="password">Mot de passe</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="access">Accès</SelectItem>
                <SelectItem value="network">Réseau</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setSelectedPolicy({} as SecurityPolicy)}>
              Nouvelle Politique
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
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière Mise à Jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies?.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>
                    <Badge>{policy.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {policy.description}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={(checked) =>
                        handlePolicyToggle(policy.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(policy.lastUpdated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePolicyDelete(policy.id)}
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
        open={!!selectedPolicy}
        onOpenChange={() => setSelectedPolicy(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPolicy?.id
                ? "Modifier la Politique"
                : "Nouvelle Politique"}
            </DialogTitle>
          </DialogHeader>

          {selectedPolicy && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handlePolicySubmit({
                  ...selectedPolicy,
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  type: formData.get("type") as SecurityPolicy["type"],
                  config: JSON.parse(formData.get("config") as string),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  name="name"
                  defaultValue={selectedPolicy.name}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  className="w-full mt-1 border rounded-md"
                  rows={3}
                  defaultValue={selectedPolicy.description}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  className="w-full mt-1 border rounded-md"
                  defaultValue={selectedPolicy.type}
                  required
                >
                  <option value="password">Mot de passe</option>
                  <option value="session">Session</option>
                  <option value="access">Accès</option>
                  <option value="network">Réseau</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Configuration</label>
                <textarea
                  name="config"
                  className="w-full mt-1 border rounded-md font-mono"
                  rows={10}
                  defaultValue={JSON.stringify(selectedPolicy.config, null, 2)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPolicy(null)}
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
