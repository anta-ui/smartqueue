"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Switch } from "@/components/common/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import {
  BellIcon,
  BellSlashIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type {
  NotificationTemplate,
  NotificationPreferences,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from "@/types/notification";

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  system: <Cog6ToothIcon className="h-5 w-5" />,
  billing: <CreditCardIcon className="h-5 w-5" />,
  security: <ShieldCheckIcon className="h-5 w-5" />,
  usage: <ChartBarIcon className="h-5 w-5" />,
  performance: <ArrowTrendingUpIcon className="h-5 w-5" />,
  maintenance: <WrenchIcon className="h-5 w-5" />,
};

const channelIcons: Record<NotificationChannel, React.ReactNode> = {
  email: <EnvelopeIcon className="h-5 w-5" />,
  in_app: <BellIcon className="h-5 w-5" />,
  slack: <ChatBubbleLeftIcon className="h-5 w-5" />,
  sms: <DevicePhoneMobileIcon className="h-5 w-5" />,
};

export default function NotificationsPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("preferences");
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const { data: preferences, loading: loadingPrefs, refresh: refreshPrefs } = useCache<NotificationPreferences>({
    key: `organization_${params.id}_notification_preferences`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${params.id}/notifications/preferences`);
      return response.json();
    },
  });

  const { data: templates, loading: loadingTemplates, refresh: refreshTemplates } = useCache<NotificationTemplate[]>({
    key: `organization_${params.id}_notification_templates`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${params.id}/notifications/templates`);
      return response.json();
    },
  });

  const handleUpdatePreferences = async (
    category: NotificationCategory,
    updates: Partial<NotificationPreferences["categories"][NotificationCategory]>
  ) => {
    try {
      await fetch(`/api/admin/organizations/${params.id}/notifications/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          updates,
        }),
      });
      refreshPrefs();
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  const handleUpdateTemplate = async (template: NotificationTemplate) => {
    try {
      await fetch(
        `/api/admin/organizations/${params.id}/notifications/templates${
          template.id ? `/${template.id}` : ""
        }`,
        {
          method: template.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        }
      );
      refreshTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error("Failed to update template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await fetch(
          `/api/admin/organizations/${params.id}/notifications/templates/${templateId}`,
          {
            method: "DELETE",
          }
        );
        refreshTemplates();
      } catch (error) {
        console.error("Failed to delete template:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preferences">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="templates">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <div className="space-y-6">
            {loadingPrefs ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              Object.entries(preferences?.categories || {}).map(([category, settings]) => (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {categoryIcons[category as NotificationCategory]}
                      <h2 className="text-lg font-medium capitalize">
                        {category} Notifications
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Notifications</div>
                          <div className="text-sm text-gray-500">
                            Receive notifications for {category} events
                          </div>
                        </div>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) =>
                            handleUpdatePreferences(category as NotificationCategory, {
                              enabled: checked,
                            })
                          }
                        />
                      </div>

                      {settings.enabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Minimum Priority
                            </label>
                            <Select
                              value={settings.minPriority}
                              onChange={(e) =>
                                handleUpdatePreferences(
                                  category as NotificationCategory,
                                  {
                                    minPriority: e.target.value as NotificationPriority,
                                  }
                                )
                              }
                              className="w-full"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Notification Channels
                            </label>
                            <div className="space-y-2">
                              {Object.entries(channelIcons).map(([channel, icon]) => (
                                <label
                                  key={channel}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={settings.channels.includes(
                                      channel as NotificationChannel
                                    )}
                                    onChange={(e) => {
                                      const newChannels = e.target.checked
                                        ? [...settings.channels, channel]
                                        : settings.channels.filter((c) => c !== channel);
                                      handleUpdatePreferences(
                                        category as NotificationCategory,
                                        {
                                          channels: newChannels as NotificationChannel[],
                                        }
                                      );
                                    }}
                                  />
                                  <span className="flex items-center gap-2">
                                    {icon}
                                    <span className="capitalize">{channel.replace("_", " ")}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Notification Schedule</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Daily Digest</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Receive a daily summary of your notifications
                      </div>
                      <Switch
                        checked={preferences?.schedules.digest.enabled}
                        onCheckedChange={(checked) =>
                          // Update digest settings
                          null
                        }
                      />
                    </div>
                    {preferences?.schedules.digest.enabled && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Time
                          </label>
                          <Input
                            type="time"
                            value={preferences.schedules.digest.time}
                            onChange={(e) =>
                              // Update digest time
                              null
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Timezone
                          </label>
                          <Select
                            value={preferences.schedules.digest.timezone}
                            onChange={(e) =>
                              // Update digest timezone
                              null
                            }
                          >
                            {/* Add timezone options */}
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Quiet Hours</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Pause notifications during specific hours
                      </div>
                      <Switch
                        checked={preferences?.schedules.quietHours.enabled}
                        onCheckedChange={(checked) =>
                          // Update quiet hours settings
                          null
                        }
                      />
                    </div>
                    {preferences?.schedules.quietHours.enabled && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={preferences.schedules.quietHours.start}
                              onChange={(e) =>
                                // Update quiet hours start
                                null
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={preferences.schedules.quietHours.end}
                              onChange={(e) =>
                                // Update quiet hours end
                                null
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={preferences.schedules.quietHours.exceptUrgent}
                              onChange={(e) =>
                                // Update except urgent setting
                                null
                              }
                            />
                            <span>Allow urgent notifications during quiet hours</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setEditingTemplate({} as NotificationTemplate)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                New Template
              </Button>
            </div>

            {loadingTemplates ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates?.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {categoryIcons[template.category]}
                          <h3 className="font-medium">{template.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.active}
                            onCheckedChange={(checked) =>
                              handleUpdateTemplate({
                                ...template,
                                active: checked,
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-500">
                          {template.description}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.channels.map((channel) => (
                            <div
                              key={channel}
                              className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                            >
                              {channelIcons[channel]}
                              <span className="capitalize">
                                {channel.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal d'édition de template */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingTemplate) {
                handleUpdateTemplate(editingTemplate);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editingTemplate?.name || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev!,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={editingTemplate?.description || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                value={editingTemplate?.category || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev!,
                    category: e.target.value as NotificationCategory,
                  }))
                }
                required
              >
                {Object.keys(categoryIcons).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Channels</label>
              <div className="space-y-2">
                {Object.entries(channelIcons).map(([channel, icon]) => (
                  <label key={channel} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingTemplate?.channels.includes(
                        channel as NotificationChannel
                      )}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...(editingTemplate?.channels || []), channel]
                          : editingTemplate?.channels.filter((c) => c !== channel);
                        setEditingTemplate((prev) => ({
                          ...prev!,
                          channels: newChannels as NotificationChannel[],
                        }));
                      }}
                    />
                    <span className="flex items-center gap-2">
                      {icon}
                      <span className="capitalize">{channel.replace("_", " ")}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                value={editingTemplate?.subject || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev!,
                    subject: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={editingTemplate?.content || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev!,
                    content: e.target.value,
                  }))
                }
                className="w-full h-32 px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTemplate(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
