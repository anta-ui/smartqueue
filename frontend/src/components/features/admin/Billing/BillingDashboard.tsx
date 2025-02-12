"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CurrencyDollarIcon, ChartBarIcon, CreditCardIcon } from "@heroicons/react/24/outline";

const MOCK_REVENUE_DATA = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 5000 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 5500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 7000 },
];

interface BillingMetric {
  label: string;
  value: string;
  change: number;
  icon: any;
}

const METRICS: BillingMetric[] = [
  {
    label: "Revenu Mensuel",
    value: "45,231€",
    change: 12.5,
    icon: CurrencyDollarIcon,
  },
  {
    label: "Clients Actifs",
    value: "1,234",
    change: 8.2,
    icon: ChartBarIcon,
  },
  {
    label: "Taux de Conversion",
    value: "32%",
    change: -2.4,
    icon: CreditCardIcon,
  },
];

export default function BillingDashboard() {
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-8">
      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <metric.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <h3 className="text-2xl font-bold">{metric.value}</h3>
                <p
                  className={`text-sm ${
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change >= 0 ? "+" : ""}
                  {metric.change}% vs période précédente
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Graphiques de revenus */}
      <Card className="p-6">
        <Tabs defaultValue="revenue" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="revenue">Revenus</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              <TabsTrigger value="churn">Churn</TabsTrigger>
            </TabsList>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
              <option value="year">Année</option>
            </select>
          </div>

          <TabsContent value="revenue" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="subscriptions">
            {/* TODO: Graphique des abonnements */}
          </TabsContent>

          <TabsContent value="churn">
            {/* TODO: Graphique du churn */}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dernières transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dernières Transactions</h3>
        {/* TODO: Tableau des transactions */}
      </Card>
    </div>
  );
}
