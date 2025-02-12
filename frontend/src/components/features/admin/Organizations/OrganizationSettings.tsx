"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface OrganizationSettingsProps {
  organizationId: string;
}

interface OrganizationSettings {
  general: {
    name: string;
    description: string;
    website: string;
    timezone: string;
    language: string;
  };
  branding: {
    logo: string;
    primaryColor: string;
    accentColor: string;
    customDomain: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    autoAssignment: boolean;
    publicProfile: boolean;
  };
  limits: {
    maxUsers: number;
    maxQueues: number;
    maxLocations: number;
    storageLimit: number;
  };
}

const timezones = [
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "Asia/Tokyo",
  // Add more timezones as needed
];

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  // Add more languages as needed
];

export default function OrganizationSettings({ organizationId }: OrganizationSettingsProps) {
  const { data: settings, loading, refresh } = useCache<OrganizationSettings>({
    key: `organization_${organizationId}_settings`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/settings`
      );
      return response.json();
    },
  });

  const [formData, setFormData] = useState<OrganizationSettings | null>(settings);

  const handleSave = async (section: keyof OrganizationSettings) => {
    if (!formData) return;

    try {
      await fetch(
        `/api/admin/organizations/${organizationId}/settings/${section}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData[section]),
        }
      );
      refresh();
      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error(`Failed to update ${section} settings:`, error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Basic information about your organization
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                value={formData.general.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.general.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, website: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.general.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  general: { ...formData.general, description: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={formData.general.timezone}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, timezone: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.general.language}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, language: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave("general")}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Branding</h3>
          <p className="text-sm text-muted-foreground">
            Customize your organization's appearance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        ...formData.branding,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-12 p-1"
                />
                <Input
                  value={formData.branding.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        ...formData.branding,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.branding.accentColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        ...formData.branding,
                        accentColor: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-12 p-1"
                />
                <Input
                  value={formData.branding.accentColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        ...formData.branding,
                        accentColor: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Custom Domain</Label>
            <Input
              value={formData.branding.customDomain}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branding: {
                    ...formData.branding,
                    customDomain: e.target.value,
                  },
                })
              }
              placeholder="app.yourdomain.com"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave("branding")}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Configure your organization's preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                checked={formData.preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      emailNotifications: checked,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS notifications for critical alerts
                </p>
              </div>
              <Switch
                checked={formData.preferences.smsNotifications}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      smsNotifications: checked,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign tickets to available agents
                </p>
              </div>
              <Switch
                checked={formData.preferences.autoAssignment}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      autoAssignment: checked,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Make your organization visible in public directory
                </p>
              </div>
              <Switch
                checked={formData.preferences.publicProfile}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      publicProfile: checked,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave("preferences")}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Resource Limits</h3>
          <p className="text-sm text-muted-foreground">
            Configure resource limits for your organization
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Users</Label>
              <Input
                type="number"
                value={formData.limits.maxUsers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      maxUsers: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Queues</Label>
              <Input
                type="number"
                value={formData.limits.maxQueues}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      maxQueues: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Locations</Label>
              <Input
                type="number"
                value={formData.limits.maxLocations}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      maxLocations: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Storage Limit (GB)</Label>
              <Input
                type="number"
                value={formData.limits.storageLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      storageLimit: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleSave("limits")}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
