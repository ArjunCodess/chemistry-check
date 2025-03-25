import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";

interface MediaByUserProps {
  stats: ChatStats;
}

export function MediaByUser({ stats }: MediaByUserProps) {
  const isWhatsApp = stats.source === "whatsapp";
  
  // Get all users with media stats
  const users = Object.entries(stats.mediaStats?.byUser || {}).sort(
    ([, a], [, b]) => b.total - a.total
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media by User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {users.map(([user, userMedia]) => {
            const userTotal = userMedia.total;
            const percentOfTotal = stats?.mediaStats?.total
              ? Math.round((userTotal / stats.mediaStats.total) * 100)
              : 0;

            return (
              <div
                key={user}
                className="border border-border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">{user}</h3>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                    {percentOfTotal}% of total
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>
                      Total Media: <strong>{userTotal}</strong>
                    </span>
                    {/* Only show size for non-WhatsApp sources */}
                    {!isWhatsApp && (
                      <span>
                        Size: <strong>{formatFileSize(userMedia.totalSize)}</strong>
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${percentOfTotal}%` }}
                    ></div>
                  </div>
                </div>

                {/* For WhatsApp, only show Other Media and Links */}
                {isWhatsApp ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-md flex gap-2 items-center">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-xs text-gray-500 leading-tight">
                          Other Media
                        </p>
                        <p className="font-medium">{userMedia.byType.documents}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md flex gap-2 items-center">
                      <span className="text-lg">🔗</span>
                      <div>
                        <p className="text-xs text-gray-500 leading-tight">
                          Links
                        </p>
                        <p className="font-medium">{userMedia.byType.links}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        name: "Images",
                        value: userMedia.byType.images,
                        icon: "📷",
                      },
                      {
                        name: "Videos",
                        value: userMedia.byType.videos,
                        icon: "🎬",
                      },
                      {
                        name: "GIFs",
                        value: userMedia.byType.animations,
                        icon: "✨",
                      },
                      {
                        name: "Documents",
                        value: userMedia.byType.documents,
                        icon: "📄",
                      },
                      {
                        name: "Stickers",
                        value: userMedia.byType.stickers,
                        icon: "🔖",
                      },
                      {
                        name: "Links",
                        value: userMedia.byType.links,
                        icon: "🔗",
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="bg-gray-50 p-3 rounded-md flex gap-2 items-center"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-xs text-gray-500 leading-tight">
                            {item.name}
                          </p>
                          <p className="font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
