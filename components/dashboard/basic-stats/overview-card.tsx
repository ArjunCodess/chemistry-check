import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface OverviewCardProps {
  stats: ChatStats;
}

export function OverviewCard({ stats }: OverviewCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Messages:</span>
            <span className="font-semibold">
              {stats.totalMessages.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Words:</span>
            <span className="font-semibold">
              {stats.totalWords.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Edited Messages:</span>
            <span className="font-semibold">
              {(stats.editedMessages?.total || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Avg Words/Message:</span>
            <span className="font-semibold">
              {stats.totalMessages > 0
                ? (stats.totalWords / stats.totalMessages).toFixed(1)
                : "0.0"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 