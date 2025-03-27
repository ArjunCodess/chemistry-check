import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";
import { Suspense } from "react";
import dynamic from "next/dynamic";

function getMediaByTypeData(stats: ChatStats) {
  const mediaStats = stats.mediaStats?.byType || {};
  return [
    { name: "Images", value: mediaStats.images || 0 },
    { name: "Videos", value: mediaStats.videos || 0 },
    { name: "GIFs", value: mediaStats.animations || 0 },
    { name: "Documents", value: mediaStats.documents || 0 },
    { name: "Stickers", value: mediaStats.stickers || 0 },
    { name: "Links", value: mediaStats.links || 0 },
  ].filter((item) => item.value > 0);
}

interface MediaOverviewProps {
  stats: ChatStats;
}

const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

export function MediaOverview({ stats }: MediaOverviewProps) {
  const isWhatsApp = stats.source === "whatsapp";
  
  const mediaData = isWhatsApp 
    ? [
        { name: "Other Media", value: stats.mediaStats?.byType?.documents || 0 },
        { name: "Links", value: stats.mediaStats?.byType?.links || 0 }
      ].filter(item => item.value > 0)
    : getMediaByTypeData(stats);

  if (mediaData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No media found in this chat.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-6 flex flex-row gap-4 justify-between w-full">
            <div className={`bg-gray-50 p-4 rounded-lg ${!isWhatsApp ? 'w-1/2' : 'w-full'}`}>
              <h3 className="text-sm text-muted-foreground">Total Media</h3>
              <p className="text-2xl font-bold">{stats.mediaStats?.total || 0}</p>
            </div>
            
            {!isWhatsApp && (
              <div className="bg-gray-50 p-4 rounded-lg w-1/2">
                <p className="text-sm text-gray-500">Total Size</p>
                <p className="text-xl font-semibold">
                  {formatFileSize(stats?.mediaStats?.totalSize ?? 0)}
                </p>
              </div>
            )}
          </div>

          <Suspense 
            fallback={
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
            }
          >
            <PieChart data={mediaData} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}