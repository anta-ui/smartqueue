"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  title: string;
  data: ChartData<"line" | "bar">;
  type: "line" | "bar";
  height?: number;
}

const defaultOptions: ChartOptions<"line" | "bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export function AnalyticsChart({ title, data, type, height = 300 }: ChartProps) {
  const options: ChartOptions<"line" | "bar"> = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div style={{ height }}>
      {type === "line" ? (
        <Line options={options} data={data} />
      ) : (
        <Bar options={options} data={data} />
      )}
    </div>
  );
}

// Composants spécialisés pour différents types de graphiques
export function WaitTimeChart({
  data,
  height,
}: {
  data: { date: string; averageWaitTime: number }[];
  height?: number;
}) {
  const chartData: ChartData<"line"> = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Average Wait Time (minutes)",
        data: data.map((item) => item.averageWaitTime),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  return (
    <AnalyticsChart
      title="Wait Time Trend"
      data={chartData}
      type="line"
      height={height}
    />
  );
}

export function ServicePointPerformanceChart({
  data,
  height,
}: {
  data: { name: string; ticketsServed: number; utilization: number }[];
  height?: number;
}) {
  const chartData: ChartData<"bar"> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Tickets Served",
        data: data.map((item) => item.ticketsServed),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Utilization (%)",
        data: data.map((item) => item.utilization),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <AnalyticsChart
      title="Service Point Performance"
      data={chartData}
      type="bar"
      height={height}
    />
  );
}

export function QueueDistributionChart({
  data,
  height,
}: {
  data: { name: string; totalTickets: number }[];
  height?: number;
}) {
  const chartData: ChartData<"pie"> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.totalTickets),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };

  return (
    <AnalyticsChart
      title="Queue Distribution"
      data={chartData}
      type="bar"
      height={height}
    />
  );
}
