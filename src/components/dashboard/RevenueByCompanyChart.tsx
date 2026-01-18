"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CompanyRevenue {
  companyName: string;
  revenue: number;
}

interface RevenueByCompanyChartProps {
  data: CompanyRevenue[];
}

export function RevenueByCompanyChart({ data }: RevenueByCompanyChartProps) {
  const chartData = {
    labels: data.map((item) => item.companyName),
    datasets: [
      {
        label: "Revenus (FCFA)",
        data: data.map((item) => item.revenue),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
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
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
