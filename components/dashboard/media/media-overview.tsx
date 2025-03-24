import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getMediaByTypeData } from "@/lib/chat-stats";

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
  const mediaData = getMediaByTypeData(stats);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Media</p>
              <p className="text-xl font-semibold">
                {(stats?.mediaStats?.total ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Size</p>
              <p className="text-xl font-semibold">
                {formatFileSize(stats?.mediaStats?.totalSize ?? 0)}
              </p>
            </div>
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