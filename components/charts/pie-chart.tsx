"use client";

import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = [
  "#FF6384", // pink
  "#36A2EB", // blue
  "#FFCE56", // yellow
  "#4BC0C0", // teal
  "#9966FF", // purple
  "#FF9F40", // orange
];

export default function PieChart({ data }: PieChartProps) {
  // Transform data to match expected format
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: COLORS[index % COLORS.length],
  }));

  // Create config based on data
  const chartConfig: ChartConfig = {
    value: {
      label: "Value",
    },
  };

  // Add each item to the config
  data.forEach((item, index) => {
    const key = item.name.toLowerCase().replace(/\s+/g, "");
    chartConfig[key] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
  });

  console.log("Pie Chart Data:", chartData); // Debug data

  return (
    <div className="flex flex-col md:py-4">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full flex-1"
      >
        <ResponsiveContainer width="100%" height={350}>
          <RechartsPieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              dataKey="value"
              nameKey="name"
              fill="#8884d8" // Default fill (shouldn't be used because we set per-segment fills)
              label={({ name, percent, ...props }) => {
                return (
                  <text
                    x={props.x}
                    y={props.y}
                    fill="hsla(var(--foreground))"
                    textAnchor={props.textAnchor}
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={500}
                  >
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                  </text>
                );
              }}
              labelLine={true}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
