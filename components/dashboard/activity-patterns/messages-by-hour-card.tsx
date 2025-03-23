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

interface MessagesByHourCardProps {
  stats: ChatStats;
}

export function MessagesByHourCard({ stats }: MessagesByHourCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages per Hour of Day</CardTitle>
        <CardDescription>
          Find peak chat hours to understand when the conversation is most active
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.messagesByHour && Object.keys(stats.messagesByHour).length > 0 ? (
          <>
            <div className="h-72">
              <BarChart
                data={Object.entries(stats.messagesByHour).map(
                  ([hour, count]) => ({
                    name: `${hour}:00`,
                    count: count as number,
                  })
                )}
                title="Hourly Message Distribution"
                height={320}
                barColor="hsl(var(--chart-1))"
              />
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                * Peak hours reveal when both parties are typically available to chat
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center p-4">
            <h3 className="text-lg font-medium mb-2">
              No hourly data available
            </h3>
            <p className="text-xs text-gray-500">
              Hourly message distribution data isn&apos;t available in this chat export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 