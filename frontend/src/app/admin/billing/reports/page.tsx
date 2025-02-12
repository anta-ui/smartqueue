"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
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
  Line,
  Bar,
} from "react-chartjs-2";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import type { FinancialReport } from "@/types/billing";

const periods = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState("30d");

  const { data: report, loading, refresh } = useCache<FinancialReport>({
    key: `financial_report_${period}`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/billing/reports?period=${period}`);
      return response.json();
    },
  });

  const exportReport = async () => {
    const response = await fetch(
      `/api/admin/billing/reports/export?period=${period}`,
      {
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${period}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex gap-2">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={periods}
          />
          <Button variant="outline" onClick={refresh}>
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
          <Button onClick={exportReport}>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">MRR</p>
                <p className="text-2xl font-semibold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.metrics.mrr || 0)}
                </p>
              </div>
              <div
                className={`flex items-center ${
                  (report?.metrics.growthRate || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(report?.metrics.growthRate || 0) >= 0 ? (
                  <ArrowUpIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 mr-1" />
                )}
                {Math.abs(report?.metrics.growthRate || 0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">ARPU</p>
                <p className="text-2xl font-semibold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.metrics.arpu || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">LTV</p>
                <p className="text-2xl font-semibold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.metrics.ltv || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                <p className="text-2xl font-semibold">
                  {report?.metrics.churnRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Revenue Trends</h2>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: report?.trends.dates,
                datasets: [
                  {
                    label: "Revenue",
                    data: report?.trends.revenue,
                    borderColor: "rgb(99, 102, 241)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) =>
                        new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(value as number),
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Subscription Growth</h2>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: report?.trends.dates,
                datasets: [
                  {
                    label: "Active Subscriptions",
                    data: report?.trends.subscriptions,
                    backgroundColor: "rgba(99, 102, 241, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Transactions Récentes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.transactions.map((transaction) => (
                <TableRow key={transaction.date}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="capitalize">{transaction.type}</TableCell>
                  <TableCell
                    className={
                      transaction.type === "refund" ? "text-red-600" : ""
                    }
                  >
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === "succeeded"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Résumé des Revenus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Revenue Breakdown</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Revenue</dt>
                <dd className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.revenue.total || 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Recurring Revenue</dt>
                <dd className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.revenue.recurring || 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">One-Time Revenue</dt>
                <dd className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.revenue.oneTime || 0)}
                </dd>
              </div>
              <div className="flex justify-between text-red-600">
                <dt>Refunds</dt>
                <dd>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(report?.revenue.refunds || 0)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Subscription Status</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Subscriptions</dt>
                <dd className="font-medium">{report?.subscriptions.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active Subscriptions</dt>
                <dd className="font-medium text-green-600">
                  {report?.subscriptions.active}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">New Subscriptions</dt>
                <dd className="font-medium text-blue-600">
                  {report?.subscriptions.new}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Canceled Subscriptions</dt>
                <dd className="font-medium text-red-600">
                  {report?.subscriptions.canceled}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
