"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  TicketIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface OrganizationAnalyticsProps {
  organizationId: string;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    userGrowth: number;
    activeQueues: number;
    queueGrowth: number;
    avgWaitTime: number;
    waitTimeChange: number;
    totalTickets: number;
    ticketGrowth: number;
  };
  userActivity: {
    date: string;
    activeUsers: number;
    newUsers: number;
  }[];
  queuePerformance: {
    queueName: string;
    averageWait: number;
    totalServed: number;
    satisfaction: number;
  }[];
  ticketTrends: {
    date: string;
    created: number;
    resolved: number;
  }[];
  peakHours: {
    hour: string;
    traffic: number;
  }[];
}

const timeRanges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export default function OrganizationAnalytics({
  organizationId,
}: OrganizationAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30d");

  const { data, loading } = useCache<AnalyticsData>({
    key: `organization_${organizationId}_analytics_${timeRange}`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/analytics?timeRange=${timeRange}`
      );
      return response.json();
    },
  });

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
              </div>
              <div
                className={`flex items-center ${
                  data.overview.userGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.overview.userGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(data.overview.userGrowth)}%</span>
              </div>
            </div>
            <UsersIcon className="h-8 w-8 text-gray-400 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Queues
                </p>
                <p className="text-2xl font-bold">{data.overview.activeQueues}</p>
              </div>
              <div
                className={`flex items-center ${
                  data.overview.queueGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.overview.queueGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(data.overview.queueGrowth)}%</span>
              </div>
            </div>
            <TicketIcon className="h-8 w-8 text-gray-400 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Wait Time
                </p>
                <p className="text-2xl font-bold">
                  {Math.floor(data.overview.avgWaitTime / 60)}m{" "}
                  {data.overview.avgWaitTime % 60}s
                </p>
              </div>
              <div
                className={`flex items-center ${
                  data.overview.waitTimeChange <= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.overview.waitTimeChange <= 0 ? (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(data.overview.waitTimeChange)}%</span>
              </div>
            </div>
            <ClockIcon className="h-8 w-8 text-gray-400 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold">{data.overview.totalTickets}</p>
              </div>
              <div
                className={`flex items-center ${
                  data.overview.ticketGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.overview.ticketGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(data.overview.ticketGrowth)}%</span>
              </div>
            </div>
            <TicketIcon className="h-8 w-8 text-gray-400 mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité des utilisateurs */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">User Activity</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users"
                    stroke="#2563eb"
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    name="New Users"
                    stroke="#16a34a"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance des files d'attente */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Queue Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.queuePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="queueName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageWait"
                    name="Avg. Wait (min)"
                    fill="#2563eb"
                  />
                  <Bar
                    dataKey="satisfaction"
                    name="Satisfaction (%)"
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tendances des tickets */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Ticket Trends</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ticketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke="#2563eb"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#16a34a"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heures de pointe */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Peak Hours</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="traffic"
                    name="Traffic"
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
