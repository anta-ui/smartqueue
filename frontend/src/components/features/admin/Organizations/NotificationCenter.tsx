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
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface NotificationCenterProps {
  organizationId: string;
}

interface NotificationChannel {
  id: string;
  type: "email" | "sms" | "push" | "webhook";
  name: string;
  enabled: boolean;
  config: {
    recipients?: string[];
    webhookUrl?: string;
    events?: string[];
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  subject?: string;
  content: string;
  variables: string[];
}

interface NotificationHistory {
  id: string;
  type: "email" | "sms" | "push" | "webhook";
  event: string;
  recipient: string;
  status: "delivered" | "failed" | "pending";
  timestamp: string;
  content: string;
}

const eventTypes = [
  "user.created",
  "user.updated",
  "queue.created",
  "queue.updated",
  "ticket.created",
  "ticket.updated",
  "ticket.completed",
];

export default function NotificationCenter({
  organizationId,
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<"channels" | "templates" | "history">(
    "channels"
  );

  const { data: channels, refresh: refreshChannels } = useCache<
    NotificationChannel[]
  >({
    key: `organization_${organizationId}_notification_channels`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/notifications/channels`
      );
      return response.json();
    },
  });

  const { data: templates } = useCache<NotificationTemplate[]>({
    key: `organization_${organizationId}_notification_templates`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/notifications/templates`
      );
      return response.json();
    },
  });

  const { data: history } = useCache<NotificationHistory[]>({
    key: `organization_${organizationId}_notification_history`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/notifications/history`
      );
      return response.json();
    },
  });

  const handleToggleChannel = async (channelId: string, enabled: boolean) => {
    try {
      await fetch(
        `/api/admin/organizations/${organizationId}/notifications/channels/${channelId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        }
      );
      refreshChannels();
    } catch (error) {
      console.error("Failed to toggle notification channel:", error);
    }
  };

  const getChannelIcon = (type: NotificationChannel["type"]) => {
    switch (type) {
      case "email":
        return <EnvelopeIcon className="h-5 w-5" />;
      case "sms":
        return <PhoneIcon className="h-5 w-5" />;
      case "push":
        return <BellIcon className="h-5 w-5" />;
      case "webhook":
        return <ChatBubbleLeftIcon className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: NotificationHistory["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "failed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">
            Manage notification channels and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "channels" ? "default" : "outline"}
            onClick={() => setActiveTab("channels")}
          >
            Channels
          </Button>
          <Button
            variant={activeTab === "templates" ? "default" : "outline"}
            onClick={() => setActiveTab("templates")}
          >
            Templates
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
          >
            History
          </Button>
        </div>
      </div>

      {activeTab === "channels" && (
        <div className="space-y-6">
          {channels?.map((channel) => (
            <Card key={channel.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getChannelIcon(channel.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {channel.type === "webhook"
                          ? channel.config.webhookUrl
                          : channel.config.recipients?.join(", ")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleChannel(channel.id, checked)
                    }
                  />
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Subscribed Events</h4>
                  <div className="flex flex-wrap gap-2">
                    {channel.config.events?.map((event) => (
                      <Badge key={event} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-6">
          {templates?.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Type: {template.type}
                      </p>
                    </div>
                    <Button variant="outline">Edit Template</Button>
                  </div>
                  {template.subject && (
                    <div>
                      <Label>Subject</Label>
                      <Input value={template.subject} readOnly />
                    </div>
                  )}
                  <div>
                    <Label>Content</Label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {template.content}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <Label>Variables</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Content</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.event}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.recipient}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(item.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">
                        {item.content}
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
