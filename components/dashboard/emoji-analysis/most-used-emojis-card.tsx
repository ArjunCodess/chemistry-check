import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
  ),
});

interface MostUsedEmojisCardProps {
  stats: ChatStats;
}

export function MostUsedEmojisCard({ stats }: MostUsedEmojisCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Most Used Emojis</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Suspense
          fallback={
            <div className="w-full h-full bg-neutral-100 animate-pulse rounded-md"></div>
          }
        >
          <BarChart
            data={(stats?.mostUsedEmojis || [])
              .slice(0, 10)
              .map((item) => ({
                name: item.emoji,
                count: item.count,
              }))}
            title="Emoji Usage"
            height={280}
            barColor="hsl(var(--chart-3))"
            multicolor={true}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}