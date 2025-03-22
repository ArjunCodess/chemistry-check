'use client';

import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  height?: number;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  }
} as const;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function PieChart({ data, height = 250 }: PieChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 