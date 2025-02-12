"use client";

import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: Array<number>;
  labels: Array<string>;
  format?: (value: number) => string;
  color?: string;
  icon?: React.ReactNode;
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  labels,
  format = (v) => v.toString(),
  color = "rgb(99, 102, 241)",
  icon,
}: MetricsCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-green-600" : "text-red-600";
  const changeIcon = isPositive ? (
    <ArrowUpIcon className="h-4 w-4" />
  ) : (
    <ArrowDownIcon className="h-4 w-4" />
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: trend,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return format(context.raw);
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-semibold">{value}</div>
          <div className={`flex items-center text-sm ${changeColor}`}>
            {changeIcon}
            <span className="ml-1">{Math.abs(change)}%</span>
          </div>
        </div>

        <div className="h-[60px] mt-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
