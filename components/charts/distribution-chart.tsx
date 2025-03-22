'use client';

import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DistributionChartProps {
  data: Array<{ category: string; count: number }>;
  title: string;
  height?: number;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  }
} as const;

export default function DistributionChart({ data, height = 250 }: DistributionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
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
          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 