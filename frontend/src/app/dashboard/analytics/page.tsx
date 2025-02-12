"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { api } from "@/services/api";

interface AnalyticsData {
  dailyStats: {
    date: string;
    totalTickets: number;
    averageWaitTime: number;
    satisfactionScore: number;
  }[];
  queuePerformance: {
    queueId: string;
    queueName: string;
    totalServed: number;
    averageServiceTime: number;
    peakHours: string[];
  }[];
  servicePointEfficiency: {
    servicePointId: string;
    servicePointName: string;
    ticketsServed: number;
    averageServiceTime: number;
    utilization: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("week"); // week, month, year

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get<AnalyticsData>(`/analytics?range=${dateRange}`);
      setData(data);
    } catch (err) {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-md ${
                dateRange === range
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Daily Statistics</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {data.dailyStats.map((stat) => (
              <div key={stat.date} className="text-center">
                <p className="text-gray-500">{new Date(stat.date).toLocaleDateString()}</p>
                <p className="text-2xl font-semibold">{stat.totalTickets}</p>
                <p className="text-sm text-gray-500">tickets</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Performance */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Queue Performance</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.queuePerformance.map((queue) => (
              <div key={queue.queueId} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{queue.queueName}</h3>
                  <span className="text-gray-500">
                    {queue.totalServed} tickets served
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Average Service Time</p>
                    <p className="text-lg">{queue.averageServiceTime} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Peak Hours</p>
                    <p className="text-lg">{queue.peakHours.join(", ")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Point Efficiency */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Service Point Efficiency</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.servicePointEfficiency.map((point) => (
              <div
                key={point.servicePointId}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <h3 className="font-medium mb-2">{point.servicePointName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tickets Served</span>
                    <span>{point.ticketsServed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg. Service Time</span>
                    <span>{point.averageServiceTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utilization</span>
                    <span>{point.utilization}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
