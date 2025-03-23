import { ChatStats } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

interface MessagesByMonthCardProps {
  stats: ChatStats;
}

export function MessagesByMonthCard({ stats }: MessagesByMonthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages per Month</CardTitle>
        <CardDescription>
          Track conversation trends over time to see how the relationship has evolved
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.messagesByMonth && Object.keys(stats.messagesByMonth).length > 0 ? (
          <>
            <div className="h-72">
              <BarChart
                data={Object.entries(stats.messagesByMonth).map(
                  ([month, count]) => ({
                    name: month,
                    count: count as number,
                  })
                )}
                title="Monthly Message Trends"
                height={320}
                barColor="hsl(var(--chart-3))"
              />
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                * Monthly trends can reveal changes in the relationship dynamics over time
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center p-4">
            <h3 className="text-lg font-medium mb-2">
              No monthly data available
            </h3>
            <p className="text-xs text-gray-500">
              Monthly message distribution data isn&apos;t available in this chat export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 