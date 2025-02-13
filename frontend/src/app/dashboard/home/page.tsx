"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface DashboardStats {
  totalQueues: number;
  activeQueues: number;
  totalTickets: number;
  averageWaitTime: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQueues: 0,
    activeQueues: 0,
    totalTickets: 0,
    averageWaitTime: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/core/dashboard/");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Queues */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Queues
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalQueues}
            </dd>
          </div>
        </div>

        {/* Active Queues */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Queues
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.activeQueues}
            </dd>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Tickets Today
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalTickets}
            </dd>
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Avg. Wait Time
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.averageWaitTime} min
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow rounded-lg">
          {/* Activity content will go here */}
          <div className="p-6 text-center text-gray-500">
            Activity feed coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}