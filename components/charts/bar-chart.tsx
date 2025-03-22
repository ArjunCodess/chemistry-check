'use client';

import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BarChartProps {
  data: Array<{ name: string; count: number }>;
  title: string;
  height?: number;
  barColor?: string;
  multicolor?: boolean;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  }
} as const;

// Array of vibrant colors for multi-colored bars
const COLORS = [
  "#FF6384", // pink
  "#36A2EB", // blue
  "#FFCE56", // yellow
  "#4BC0C0", // teal
  "#9966FF", // purple
  "#FF9F40", // orange
  "#8AC926", // lime green
  "#F15BB5", // hot pink
  "#00BBF9", // bright blue
  "#9B5DE5"  // lavender
];

export default function BarChart({ data, height = 250, barColor = "hsl(var(--chart-1))", multicolor = true }: BarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full flex-1 flex flex-col">
      <ResponsiveContainer width="100%" height={height || "100%"}>
        <RechartsBarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: '0.75rem' }}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: '0.75rem' }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4} fill={multicolor ? undefined : barColor}>
            {multicolor && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 