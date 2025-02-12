"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
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
} from "@/components/common/Dialog";
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  ClipboardIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import type { ApiKey, ApiUsageMetrics } from "@/types/api";

export default function ApiKeysPage() {
  const params = useParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<Partial<ApiKey>>({
    name: "",
    metadata: {
      description: "",
      environment: "development",
    },
    permissions: [],
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: keys, loading, refresh } = useCache<ApiKey[]>({
    key: `organization_${params.id}_api_keys`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${params.id}/api-keys`);
      return response.json();
    },
  });

  const { data: metrics } = useCache<ApiUsageMetrics>({
    key: `organization_${params.id}_api_metrics`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${params.id}/api-keys/metrics`
      );
      return response.json();
    },
  });

  const handleCreateKey = async () => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${params.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newKey),
        }
      );
      const data = await response.json();
      setCopiedKey(data.key);
      refresh();
      setShowCreateDialog(false);
      setNewKey({
        name: "",
        metadata: {
          description: "",
          environment: "development",
        },
        permissions: [],
      });
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (confirm("Are you sure you want to revoke this API key?")) {
      try {
        await fetch(
          `/api/admin/organizations/${params.id}/api-keys/${keyId}/revoke`,
          {
            method: "POST",
          }
        );
        refresh();
      } catch (error) {
        console.error("Failed to revoke API key:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Métriques d'utilisation */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Requests
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.summary.totalRequests.toLocaleString()}
                  </p>
                </div>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold">
                    {(metrics.summary.successRate * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg. Latency
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.summary.averageLatency.toFixed(0)}ms
                  </p>
                </div>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Error Rate</p>
                  <p className="text-2xl font-semibold">
                    {(
                      (metrics.summary.totalErrors /
                        metrics.summary.totalRequests) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des clés API */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : (
                keys?.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-sm text-gray-500">
                          {key.metadata.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded">
                        {key.prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.metadata.environment === "production"
                            ? "bg-green-100 text-green-800"
                            : key.metadata.environment === "staging"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {key.metadata.environment}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.revokedAt
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {key.revokedAt ? "Revoked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedKey(key);
                            setShowUsageDialog(true);
                          }}
                        >
                          <ChartBarIcon className="h-5 w-5" />
                        </Button>
                        {!key.revokedAt && (
                          <Button
                            variant="ghost"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de création de clé */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateKey();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newKey.name}
                onChange={(e) =>
                  setNewKey((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                value={newKey.metadata?.description}
                onChange={(e) =>
                  setNewKey((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      description: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Environment
              </label>
              <Select
                value={newKey.metadata?.environment}
                onChange={(e) =>
                  setNewKey((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      environment: e.target.value,
                    },
                  }))
                }
                required
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                IP Restrictions
              </label>
              <Input
                placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                value={newKey.metadata?.ipRestrictions?.join(", ") || ""}
                onChange={(e) =>
                  setNewKey((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      ipRestrictions: e.target.value
                        .split(",")
                        .map((ip) => ip.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Key</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'affichage de la nouvelle clé */}
      <Dialog
        open={!!copiedKey}
        onOpenChange={() => {
          setCopiedKey(null);
          refresh();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Make sure to copy your API key now. You won't be able to see it
              again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded">
                {copiedKey}
              </code>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(copiedKey!);
                }}
              >
                <ClipboardIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'utilisation de la clé */}
      <Dialog
        open={showUsageDialog}
        onOpenChange={() => {
          setShowUsageDialog(false);
          setSelectedKey(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Key Usage</DialogTitle>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Usage Trends</h3>
                <Line
                  data={{
                    labels: selectedKey.usage.historical.dates,
                    datasets: [
                      {
                        label: "Requests",
                        data: selectedKey.usage.historical.requests,
                        borderColor: "rgb(99, 102, 241)",
                        tension: 0.4,
                      },
                      {
                        label: "Errors",
                        data: selectedKey.usage.historical.errors,
                        borderColor: "rgb(239, 68, 68)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Usage</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total Requests</dt>
                      <dd className="font-medium">
                        {selectedKey.usage.current.requests.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Error Rate</dt>
                      <dd className="font-medium">
                        {(
                          (selectedKey.usage.current.errors /
                            selectedKey.usage.current.requests) *
                          100
                        ).toFixed(1)}
                        %
                      </dd>
                    </div>
                    {selectedKey.usage.current.lastError && (
                      <div className="pt-2">
                        <dt className="text-gray-500 mb-1">Last Error</dt>
                        <dd className="font-mono text-sm bg-red-50 text-red-700 p-2 rounded">
                          {selectedKey.usage.current.lastError.code}:{" "}
                          {selectedKey.usage.current.lastError.message}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Rate Limits</h3>
                  {selectedKey.metadata.rateLimits ? (
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Limit</dt>
                        <dd className="font-medium">
                          {selectedKey.metadata.rateLimits.requests} per{" "}
                          {selectedKey.metadata.rateLimits.period}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Current Usage</dt>
                        <dd className="font-medium">
                          {(
                            (selectedKey.usage.current.requests /
                              selectedKey.metadata.rateLimits.requests) *
                            100
                          ).toFixed(1)}
                          %
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-gray-500">No rate limits configured</p>
                  )}
                </div>
              </div>

              {selectedKey.metadata.ipRestrictions?.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">IP Restrictions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKey.metadata.ipRestrictions.map((ip) => (
                      <div
                        key={ip}
                        className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                      >
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span>{ip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
