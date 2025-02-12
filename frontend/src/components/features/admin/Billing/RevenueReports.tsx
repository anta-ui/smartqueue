"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@heroicons/react/24/outline";

// Mock data
const REVENUE_DATA = [
  { month: "Jan", revenue: 4000, target: 3800, growth: 5 },
  { month: "Feb", revenue: 5000, target: 4000, growth: 25 },
  { month: "Mar", revenue: 4800, target: 4200, growth: -4 },
  { month: "Apr", revenue: 5500, target: 4500, growth: 14.6 },
  { month: "May", revenue: 6000, target: 5000, growth: 9.1 },
  { month: "Jun", revenue: 7000, target: 5500, growth: 16.7 },
];

const REVENUE_BY_PLAN = [
  { name: "Basic", value: 4000 },
  { name: "Pro", value: 3000 },
  { name: "Enterprise", value: 2000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function RevenueReports() {
  const [period, setPeriod] = useState("month");
  const [reportType, setReportType] = useState("revenue");

  const downloadReport = () => {
    // TODO: Implémenter le téléchargement du rapport
    console.log("Téléchargement du rapport...");
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Période</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type de rapport</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenus</SelectItem>
                  <SelectItem value="growth">Croissance</SelectItem>
                  <SelectItem value="forecast">Prévisions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={downloadReport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Télécharger le rapport
          </Button>
        </div>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Revenu Total</h3>
          <p className="text-3xl font-bold">324,521€</p>
          <p className="text-sm text-green-600">+15.3% vs période précédente</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">MRR</h3>
          <p className="text-3xl font-bold">54,087€</p>
          <p className="text-sm text-green-600">+8.7% vs période précédente</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">ARR</h3>
          <p className="text-3xl font-bold">649,044€</p>
          <p className="text-sm text-green-600">+8.7% vs période précédente</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">LTV Moyen</h3>
          <p className="text-3xl font-bold">1,234€</p>
          <p className="text-sm text-green-600">+5.2% vs période précédente</p>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenus vs Objectifs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenus vs Objectifs</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenus" />
                <Bar dataKey="target" fill="#82ca9d" name="Objectifs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Croissance des revenus */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Croissance des revenus</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution par plan */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution par plan</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_BY_PLAN}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {REVENUE_BY_PLAN.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Prévisions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Prévisions de revenus</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Réel"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#82ca9d"
                  name="Prévision"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
