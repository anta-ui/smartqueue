"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CubeIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import type { SystemSettings } from "@/types/admin";

export default function SystemSettings() {
  const { data: settings, loading, refresh } = useCache<SystemSettings>({
    key: "system_settings",
    fetchData: async () => {
      const response = await fetch("/api/admin/settings/system");
      return response.json();
    },
  });

  const handleSettingsSubmit = async (
    section: keyof SystemSettings,
    data: any
  ) => {
    try {
      const response = await fetch(`/api/admin/settings/system/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error(`Failed to update ${section} settings:`, error);
    }
  };

  const handleTestIntegration = async (integration: string) => {
    try {
      const response = await fetch(
        `/api/admin/settings/system/integrations/${integration}/test`,
        { method: "POST" }
      );
      
      if (response.ok) {
        alert("Test successful!");
      } else {
        alert("Test failed. Please check your configuration.");
      }
    } catch (error) {
      console.error(`Failed to test ${integration}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Configuration du Système</h2>
          <p className="text-sm text-gray-500">
            Gérez les paramètres globaux du système
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList>
              <TabsTrigger value="email">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="geolocation">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                Géolocalisation
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <CubeIcon className="h-5 w-5 mr-2" />
                Intégrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label>Fournisseur Email</Label>
                <select
                  className="w-full mt-1 border rounded-md"
                  value={settings?.email.provider}
                  onChange={(e) =>
                    handleSettingsSubmit("email", {
                      ...settings?.email,
                      provider: e.target.value,
                    })
                  }
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>

              {settings?.email.provider === "smtp" && (
                <div className="space-y-4">
                  <div>
                    <Label>Serveur SMTP</Label>
                    <Input
                      value={settings.email.config.host}
                      onChange={(e) =>
                        handleSettingsSubmit("email", {
                          ...settings.email,
                          config: {
                            ...settings.email.config,
                            host: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input
                      type="number"
                      value={settings.email.config.port}
                      onChange={(e) =>
                        handleSettingsSubmit("email", {
                          ...settings.email,
                          config: {
                            ...settings.email.config,
                            port: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">Templates Email</h3>
                {Object.entries(settings?.email.templates || {}).map(
                  ([key, value]) => (
                    <div key={key}>
                      <Label>{key}</Label>
                      <textarea
                        className="w-full mt-1 border rounded-md"
                        rows={4}
                        value={value}
                        onChange={(e) =>
                          handleSettingsSubmit("email", {
                            ...settings.email,
                            templates: {
                              ...settings.email.templates,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div>
                <Label>Fournisseur SMS</Label>
                <select
                  className="w-full mt-1 border rounded-md"
                  value={settings?.sms.provider}
                  onChange={(e) =>
                    handleSettingsSubmit("sms", {
                      ...settings?.sms,
                      provider: e.target.value,
                    })
                  }
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={settings?.sms.config.apiKey}
                    onChange={(e) =>
                      handleSettingsSubmit("sms", {
                        ...settings.sms,
                        config: {
                          ...settings.sms.config,
                          apiKey: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Templates SMS</Label>
                  {Object.entries(settings?.sms.templates || {}).map(
                    ([key, value]) => (
                      <div key={key} className="mt-2">
                        <Label>{key}</Label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleSettingsSubmit("sms", {
                              ...settings.sms,
                              templates: {
                                ...settings.sms.templates,
                                [key]: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="geolocation" className="space-y-4">
              <div>
                <Label>Service de Géolocalisation</Label>
                <select
                  className="w-full mt-1 border rounded-md"
                  value={settings?.geolocation.provider}
                  onChange={(e) =>
                    handleSettingsSubmit("geolocation", {
                      ...settings?.geolocation,
                      provider: e.target.value,
                    })
                  }
                >
                  <option value="google">Google Maps</option>
                  <option value="mapbox">Mapbox</option>
                </select>
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={settings?.geolocation.apiKey}
                  onChange={(e) =>
                    handleSettingsSubmit("geolocation", {
                      ...settings.geolocation,
                      apiKey: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Région par Défaut</Label>
                <Input
                  value={settings?.geolocation.region}
                  onChange={(e) =>
                    handleSettingsSubmit("geolocation", {
                      ...settings.geolocation,
                      region: e.target.value,
                    })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              {Object.entries(settings?.integrations || {}).map(
                ([key, value]) => (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <CloudIcon className="h-5 w-5" />
                          <h3 className="font-medium capitalize">{key}</h3>
                        </div>
                        <Switch
                          checked={value.enabled}
                          onCheckedChange={(checked) =>
                            handleSettingsSubmit("integrations", {
                              ...settings.integrations,
                              [key]: {
                                ...value,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>

                      {value.enabled && (
                        <div className="space-y-4">
                          {Object.entries(value.config).map(([configKey, configValue]) => (
                            <div key={configKey}>
                              <Label className="capitalize">
                                {configKey.replace(/_/g, " ")}
                              </Label>
                              <Input
                                type={
                                  configKey.toLowerCase().includes("key") ||
                                  configKey.toLowerCase().includes("secret")
                                    ? "password"
                                    : "text"
                                }
                                value={configValue}
                                onChange={(e) =>
                                  handleSettingsSubmit("integrations", {
                                    ...settings.integrations,
                                    [key]: {
                                      ...value,
                                      config: {
                                        ...value.config,
                                        [configKey]: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            onClick={() => handleTestIntegration(key)}
                          >
                            Tester la connexion
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
