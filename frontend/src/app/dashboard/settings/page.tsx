"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface Settings {
  organization: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
  display: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  queue: {
    defaultServiceTime: number;
    maxWaitingTime: number;
    autoCloseEnabled: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    organization: {
      name: "SmartQueue Organization",
      email: "contact@smartqueue.com",
      phone: "+1234567890",
      address: "123 Queue Street",
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
    },
    display: {
      language: "en",
      timezone: "UTC",
      dateFormat: "DD/MM/YYYY",
    },
    queue: {
      defaultServiceTime: 15,
      maxWaitingTime: 120,
      autoCloseEnabled: true,
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Organization Settings</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Organization Name"
              value={settings.organization.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  organization: {
                    ...settings.organization,
                    name: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Email"
              type="email"
              value={settings.organization.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  organization: {
                    ...settings.organization,
                    email: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Phone"
              value={settings.organization.phone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  organization: {
                    ...settings.organization,
                    phone: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Address"
              value={settings.organization.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  organization: {
                    ...settings.organization,
                    address: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Notification Settings</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.smsEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      smsEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.pushEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      pushEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Queue Settings</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Default Service Time (minutes)"
              type="number"
              value={settings.queue.defaultServiceTime}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  queue: {
                    ...settings.queue,
                    defaultServiceTime: parseInt(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Maximum Waiting Time (minutes)"
              type="number"
              value={settings.queue.maxWaitingTime}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  queue: {
                    ...settings.queue,
                    maxWaitingTime: parseInt(e.target.value),
                  },
                })
              }
            />
            <div className="flex items-center justify-between">
              <span>Auto-close Queues</span>
              <input
                type="checkbox"
                checked={settings.queue.autoCloseEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    queue: {
                      ...settings.queue,
                      autoCloseEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          className="w-full sm:w-auto"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
