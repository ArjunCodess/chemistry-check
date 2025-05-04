import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";
import { Suspense } from "react";
import dynamic from "next/dynamic";

function getMediaByTypeData(stats: ChatStats) {
  const mediaStats = stats.mediaStats?.byType || {};
  const isInstagram = stats.source === "instagram";

  const standardTypes = [
    { name: "Images", value: mediaStats.images || 0 },
    { name: "Videos", value: mediaStats.videos || 0 },
    { name: "GIFs", value: mediaStats.animations || 0 },
    { name: "Documents", value: mediaStats.documents || 0 },
    { name: "Stickers", value: mediaStats.stickers || 0 },
    { name: "Links", value: mediaStats.links || 0 },
  ];

  // Add Instagram-specific types if they exist and we're dealing with Instagram data
  const instagramTypes = isInstagram
    ? [
        { name: "Reels", value: mediaStats.reels || 0 },
        { name: "Stories", value: mediaStats.stories || 0 },
        { name: "Posts", value: mediaStats.posts || 0 },
      ]
    : [];

  return [...standardTypes, ...instagramTypes].filter((item) => item.value > 0);
}

interface MediaOverviewProps {
  stats: ChatStats;
}

const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
  ),
});

export function MediaOverview({ stats }: MediaOverviewProps) {
  const isWhatsApp = stats.source === "whatsapp";
  const isInstagram = stats.source === "instagram";
  const isTelegram = stats.source === "telegram";

  const mediaData = isWhatsApp
    ? [
        {
          name: "Other Media",
          value: stats.mediaStats?.byType?.documents || 0,
        },
        { name: "Links", value: stats.mediaStats?.byType?.links || 0 },
      ].filter((item) => item.value > 0)
    : getMediaByTypeData(stats);

  // Find Instagram-specific media counts
  const instagramReels = isInstagram ? stats.mediaStats?.byType?.reels || 0 : 0;
  const instagramStories = isInstagram
    ? stats.mediaStats?.byType?.stories || 0
    : 0;
  const instagramPosts = isInstagram ? stats.mediaStats?.byType?.posts || 0 : 0;

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
          {/* Top Stats Row - Basic View */}
          <div className="mb-6 flex flex-row gap-4 justify-between w-full">
            <div className={`bg-neutral-50 p-4 rounded-lg ${isTelegram ? 'w-1/2' : 'w-full'}`}>
              <h3 className="text-sm text-muted-foreground">Total Media</h3>
              <p className="text-2xl font-bold">
                {stats.mediaStats?.total || 0}
              </p>
            </div>

            {isTelegram && (
              <div className="bg-neutral-50 p-4 rounded-lg w-1/2">
                <p className="text-sm text-neutral-500">Total Size</p>
                <p className="text-xl font-semibold">
                  {formatFileSize(stats?.mediaStats?.totalSize ?? 0)}
                </p>
              </div>
            )}
          </div>

          {/* For Instagram, show special media types in cards like in the image */}
          {isInstagram && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 w-full">
              <div className="bg-pink-50 p-4 rounded-lg flex items-center">
                <div className="flex-1">
                  <h3 className="text-pink-800 font-medium">Instagram Reels</h3>
                  <p className="text-2xl font-bold text-pink-600">
                    {instagramReels}
                  </p>
                </div>
                <div className="text-3xl">📱</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <div className="flex-1">
                  <h3 className="text-blue-800 font-medium">Story Shares</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {instagramStories}
                  </p>
                </div>
                <div className="text-3xl">🎭</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                <div className="flex-1">
                  <h3 className="text-yellow-800 font-medium">Post Shares</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {instagramPosts}
                  </p>
                </div>
                <div className="text-3xl">📷</div>
              </div>
            </div>
          )}

          <Suspense
            fallback={
              <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
            }
          >
            <PieChart data={mediaData} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}
