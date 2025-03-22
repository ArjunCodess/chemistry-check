'use client';

import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface LineChartProps {
  data: Array<{ 
    [key: string]: string | number | null | undefined;
  }>;
  dataKeys: string[];
  title: string;
  height?: number;
  colors?: string[];
  xAxisKey?: string;
}

const defaultColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function LineChart({ 
  data, 
  dataKeys, 
  height = 300, 
  colors = defaultColors,
  xAxisKey = "date"
}: LineChartProps) {
  // Create config for all data keys
  const chartConfig = dataKeys.reduce((config, key, index) => {
    return {
      ...config,
      [key]: {
        label: key,
        color: colors[index % colors.length],
      }
    };
  }, {});

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
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
          <ChartLegend content={<ChartLegendContent />} />
          
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 