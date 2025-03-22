'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface GapData {
  time: string;
  gap: number;
  user: string;
}

interface GapAnalysisProps {
  data: GapData[];
  title: string;
  height?: number;
}

const chartConfig = {
  gap: {
    label: "Gap (minutes)",
    color: "hsl(var(--chart-1))",
  }
} as const;

export default function GapAnalysis({ data, title, height = 300 }: GapAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const maxGap = Math.max(...data.map(d => d.gap));
  const avgGap = data.reduce((sum, d) => sum + d.gap, 0) / data.length;
  const ghostingCount = data.filter(d => d.gap > 60).length; // Gaps over 60 minutes

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-sm mb-2">
          <div className="bg-muted p-2 rounded-md">
            <div className="font-medium">Max Gap</div>
            <div className="text-2xl font-bold">{maxGap.toFixed(0)} min</div>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="font-medium">Average</div>
            <div className="text-2xl font-bold">{avgGap.toFixed(1)} min</div>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="font-medium">Ghosting Count</div>
            <div className="text-2xl font-bold">{ghostingCount}</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="w-full">
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: '0.75rem' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: '0.75rem' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="gap"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1) / 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 