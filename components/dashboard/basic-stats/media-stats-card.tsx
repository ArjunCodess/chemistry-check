import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";

interface MediaStatsCardProps {
  stats: ChatStats;
}

export function MediaStatsCard({ stats }: MediaStatsCardProps) {
  const isWhatsApp = stats.source === "whatsapp";
  const isInstagram = stats.source === "instagram";

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
          
          {!isWhatsApp && !isInstagram && (
            <>
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
            </>
          )}
          
          {isWhatsApp && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Other Media:</span>
                <span className="font-semibold">
                  {(stats.mediaStats?.byType?.documents || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Links:</span>
                <span className="font-semibold">
                  {(stats.mediaStats?.byType?.links || 0).toLocaleString()}
                </span>
              </div>
            </>
          )}

          {isInstagram && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Images:</span>
                <span className="font-semibold">
                  {(stats.mediaStats?.byType?.images || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reels:</span>
                <span className="font-semibold">
                  {(stats.mediaStats?.byType?.reels || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Links:</span>
                <span className="font-semibold">
                  {(stats.mediaStats?.byType?.links || 0).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 