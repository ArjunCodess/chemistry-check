import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";

interface MediaStatsCardProps {
  stats: ChatStats;
}

export function MediaStatsCard({ stats }: MediaStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Media:</span>
            <span className="font-semibold">
              {(stats.mediaStats?.total || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Size:</span>
            <span className="font-semibold">
              {formatFileSize(stats.mediaStats?.totalSize || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Images:</span>
            <span className="font-semibold">
              {(stats.mediaStats?.byType?.images || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Videos:</span>
            <span className="font-semibold">
              {(stats.mediaStats?.byType?.videos || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 