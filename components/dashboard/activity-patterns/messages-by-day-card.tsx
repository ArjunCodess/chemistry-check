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
    <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
  ),
});

interface MessagesByDayCardProps {
  stats: ChatStats;
}

export function MessagesByDayCard({ stats }: MessagesByDayCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages per Day of Week</CardTitle>
        <CardDescription>
          Identify which days of the week you communicate most
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.messagesByDay && Object.keys(stats.messagesByDay).length > 0 ? (
          <>
            <div className="h-72">
              <BarChart
                data={Object.entries(stats.messagesByDay).map(
                  ([day, count]) => ({
                    name: day.substring(0, 3),
                    count: count as number,
                  })
                )}
                title="Daily Message Patterns"
                height={320}
                barColor="hsl(var(--chart-2))"
              />
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                * Weekend patterns often differ from weekday communication styles
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center p-4">
            <h3 className="text-lg font-medium mb-2">
              No daily data available
            </h3>
            <p className="text-xs text-neutral-500">
              Day of week message distribution data isn&apos;t available in this chat export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 