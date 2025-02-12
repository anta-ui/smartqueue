"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheckIcon,
  KeyIcon,
  FingerPrintIcon,
  LockClosedIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface SecuritySettingsProps {
  organizationId: string;
}

interface SecuritySettings {
  authentication: {
    mfa: boolean;
    mfaMethods: ("authenticator" | "sms" | "email")[];
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
      expiryDays: number;
    };
    singleSession: boolean;
  };
  access: {
    ipWhitelist: string[];
    allowedCountries: string[];
    deviceRestrictions: boolean;
    trustedDevices: {
      id: string;
      name: string;
      lastSeen: string;
      browser: string;
      os: string;
    }[];
  };
  audit: {
    retentionDays: number;
    sensitiveActions: string[];
    exportEnabled: boolean;
  };
}

interface SecurityAlert {
  id: string;
  type: "high" | "medium" | "low";
  message: string;
  timestamp: string;
  status: "open" | "resolved" | "dismissed";
  details: string;
}

export default function SecuritySettings({
  organizationId,
}: SecuritySettingsProps) {
  const [activeTab, setActiveTab] = useState<
    "authentication" | "access" | "audit" | "alerts"
  >("authentication");

  const { data: settings, refresh: refreshSettings } = useCache<SecuritySettings>({
    key: `organization_${organizationId}_security_settings`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/security/settings`
      );
      return response.json();
    },
  });

  const { data: alerts } = useCache<SecurityAlert[]>({
    key: `organization_${organizationId}_security_alerts`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/security/alerts`
      );
      return response.json();
    },
  });

  const handleUpdateSettings = async (
    section: keyof SecuritySettings,
    data: any
  ) => {
    try {
      await fetch(
        `/api/admin/organizations/${organizationId}/security/settings/${section}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      refreshSettings();
    } catch (error) {
      console.error("Failed to update security settings:", error);
    }
  };

  const handleAlertAction = async (
    alertId: string,
    action: "resolve" | "dismiss"
  ) => {
    try {
      await fetch(
        `/api/admin/organizations/${organizationId}/security/alerts/${alertId}/${action}`,
        {
          method: "POST",
        }
      );
      refreshSettings();
    } catch (error) {
      console.error("Failed to update alert:", error);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <p className="text-muted-foreground">
            Configure security and access controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "authentication" ? "default" : "outline"}
            onClick={() => setActiveTab("authentication")}
          >
            Authentication
          </Button>
          <Button
            variant={activeTab === "access" ? "default" : "outline"}
            onClick={() => setActiveTab("access")}
          >
            Access Control
          </Button>
          <Button
            variant={activeTab === "audit" ? "default" : "outline"}
            onClick={() => setActiveTab("audit")}
          >
            Audit
          </Button>
          <Button
            variant={activeTab === "alerts" ? "default" : "outline"}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts
          </Button>
        </div>
      </div>

      {activeTab === "authentication" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FingerPrintIcon className="h-5 w-5" />
                <h3 className="font-medium">Multi-Factor Authentication</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require MFA</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce multi-factor authentication for all users
                  </p>
                </div>
                <Switch
                  checked={settings.authentication.mfa}
                  onCheckedChange={(checked) =>
                    handleUpdateSettings("authentication", {
                      ...settings.authentication,
                      mfa: checked,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed MFA Methods</Label>
                <div className="flex gap-2">
                  {["authenticator", "sms", "email"].map((method) => (
                    <Button
                      key={method}
                      variant={
                        settings.authentication.mfaMethods.includes(
                          method as any
                        )
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleUpdateSettings("authentication", {
                          ...settings.authentication,
                          mfaMethods: settings.authentication.mfaMethods.includes(
                            method as any
                          )
                            ? settings.authentication.mfaMethods.filter(
                                (m) => m !== method
                              )
                            : [...settings.authentication.mfaMethods, method],
                        })
                      }
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                <h3 className="font-medium">Password Policy</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input
                    type="number"
                    value={settings.authentication.passwordPolicy.minLength}
                    onChange={(e) =>
                      handleUpdateSettings("authentication", {
                        ...settings.authentication,
                        passwordPolicy: {
                          ...settings.authentication.passwordPolicy,
                          minLength: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={settings.authentication.passwordPolicy.expiryDays}
                    onChange={(e) =>
                      handleUpdateSettings("authentication", {
                        ...settings.authentication,
                        passwordPolicy: {
                          ...settings.authentication.passwordPolicy,
                          expiryDays: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                {[
                  {
                    key: "requireNumbers",
                    label: "Require Numbers",
                    description: "Must contain at least one number",
                  },
                  {
                    key: "requireSymbols",
                    label: "Require Symbols",
                    description: "Must contain at least one special character",
                  },
                  {
                    key: "requireUppercase",
                    label: "Require Uppercase",
                    description: "Must contain at least one uppercase letter",
                  },
                ].map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.authentication.passwordPolicy[
                          key as keyof typeof settings.authentication.passwordPolicy
                        ]
                      }
                      onCheckedChange={(checked) =>
                        handleUpdateSettings("authentication", {
                          ...settings.authentication,
                          passwordPolicy: {
                            ...settings.authentication.passwordPolicy,
                            [key]: checked,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "access" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5" />
                <h3 className="font-medium">IP Whitelist</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add IP address..."
                  className="flex-1"
                />
                <Button>Add IP</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.access.ipWhitelist.map((ip) => (
                  <Badge key={ip} variant="secondary">
                    {ip}
                    <button
                      className="ml-2 hover:text-red-500"
                      onClick={() =>
                        handleUpdateSettings("access", {
                          ...settings.access,
                          ipWhitelist: settings.access.ipWhitelist.filter(
                            (i) => i !== ip
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-5 w-5" />
                <h3 className="font-medium">Trusted Devices</h3>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.access.trustedDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.browser}</TableCell>
                      <TableCell>{device.os}</TableCell>
                      <TableCell>
                        {new Date(device.lastSeen).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            handleUpdateSettings("access", {
                              ...settings.access,
                              trustedDevices:
                                settings.access.trustedDevices.filter(
                                  (d) => d.id !== device.id
                                ),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <h3 className="font-medium">Audit Log Settings</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Retention Period (days)</Label>
                <Input
                  type="number"
                  value={settings.audit.retentionDays}
                  onChange={(e) =>
                    handleUpdateSettings("audit", {
                      ...settings.audit,
                      retentionDays: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monitored Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.audit.sensitiveActions.map((action) => (
                    <Badge key={action} variant="secondary">
                      {action}
                      <button
                        className="ml-2 hover:text-red-500"
                        onClick={() =>
                          handleUpdateSettings("audit", {
                            ...settings.audit,
                            sensitiveActions:
                              settings.audit.sensitiveActions.filter(
                                (a) => a !== action
                              ),
                          })
                        }
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow exporting audit logs
                  </p>
                </div>
                <Switch
                  checked={settings.audit.exportEnabled}
                  onCheckedChange={(checked) =>
                    handleUpdateSettings("audit", {
                      ...settings.audit,
                      exportEnabled: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "alerts" && alerts && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge
                        variant={
                          alert.type === "high"
                            ? "destructive"
                            : alert.type === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.status === "open"
                            ? "destructive"
                            : alert.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {alert.status === "open" && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleAlertAction(alert.id, "resolve")
                              }
                            >
                              Resolve
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                handleAlertAction(alert.id, "dismiss")
                              }
                            >
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
