"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";

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

interface RevenueData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  period?: string;
}

export function RevenueChart({ data, period = "30" }: RevenueChartProps) {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    }),
    datasets: [
      {
        label: "Revenus (FCFA)",
        data: data.map((item) => item.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            return `Revenus: ${new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              notation: "compact",
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des revenus ({period} derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "300px" }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
