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
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import type { AuditEvent, AuditEventType, AuditEventSeverity } from "@/types/audit";

const severityIcons = {
  info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
  warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
  error: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
};

const eventTypeCategories = {
  user: ["user.login", "user.logout", "user.created", "user.updated", "user.deleted", "user.blocked", "user.unblocked"],
  organization: ["organization.created", "organization.updated", "organization.deleted", "organization.suspended", "organization.activated"],
  billing: ["billing.subscription.created", "billing.subscription.updated", "billing.subscription.canceled", "billing.invoice.created", "billing.invoice.paid", "billing.invoice.voided", "billing.payment.succeeded", "billing.payment.failed"],
  api: ["api.key.created", "api.key.revoked"],
  security: ["security.mfa.enabled", "security.mfa.disabled", "security.password.changed", "security.password.reset", "security.access.granted", "security.access.revoked"],
  settings: ["settings.updated"],
};

export default function AuditPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [filters, setFilters] = useState({
    eventType: "",
    severity: "",
    actor: "",
  });

  const { data: events, loading, refresh } = useCache<{
    events: AuditEvent[];
    total: number;
    page: number;
    pageSize: number;
  }>({
    key: `organization_${params.id}_audit`,
    fetchData: async () => {
      const searchParams = new URLSearchParams({
        search,
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...filters,
      });
      const response = await fetch(
        `/api/admin/organizations/${params.id}/audit?${searchParams}`
      );
      return response.json();
    },
  });

  const handleExport = async () => {
    const searchParams = new URLSearchParams({
      startDate: dateRange.start,
      endDate: dateRange.end,
      ...filters,
    });
    window.open(
      `/api/admin/organizations/${params.id}/audit/export?${searchParams}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Button onClick={handleExport}>
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Log
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search audit log..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
            <Select
              value={filters.eventType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, eventType: e.target.value }))
              }
            >
              <option value="">All Events</option>
              {Object.entries(eventTypeCategories).map(([category, events]) => (
                <optgroup key={category} label={category.toUpperCase()}>
                  {events.map((event) => (
                    <option key={event} value={event}>
                      {event.split(".").join(" → ")}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            <Select
              value={filters.severity}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, severity: e.target.value }))
              }
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : (
                events?.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {severityIcons[event.severity]}
                        <span className="font-medium">
                          {event.type.split(".").join(" → ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {event.actor.type === "user" ? (
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        ) : event.actor.type === "system" ? (
                          <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <CodeBracketIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <span>{event.actor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.target && (
                        <div className="text-sm">
                          <div className="font-medium">{event.target.name}</div>
                          <div className="text-gray-500">
                            {event.target.type}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4" />
                          {[
                            event.location.city,
                            event.location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono text-xs">
                          {event.ip && `IP: ${event.ip}`}
                        </div>
                        {event.userAgent && (
                          <div className="text-gray-500 truncate max-w-xs">
                            {event.userAgent}
                          </div>
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

      {events && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {events.events.length} of {events.total} events
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={events.page === 1}
              onClick={() => {
                // Previous page
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={events.events.length < events.pageSize}
              onClick={() => {
                // Next page
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
