import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface EmojisByUserCardProps {
  stats: ChatStats;
}

export function EmojisByUserCard({ stats }: EmojisByUserCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Used Emojis by User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(stats.emojiStats?.byUser || {}).map((user, userIndex) => {
          // Get emojis frequency for this user
          const userEmojis = Object.entries(
            stats.emojiStats?.byUser[user] || {}
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([emoji, count]) => ({
              emoji,
              count: count as number,
            }));

          // Find max count for scaling
          const maxCount = userEmojis.length > 0 ? userEmojis[0].count : 0;

          // Choose a color based on user index
          const colors = [
            "bg-cyan-500",
            "bg-orange-500",
            "bg-teal-500",
            "bg-pink-500",
            "bg-violet-500",
          ];
          const barColor = colors[userIndex % colors.length];

          return (
            <div key={`emojis-${user}`} className="border-b pb-4 last:border-b-0">
              <h3 className="text-lg font-medium mb-3">{user}</h3>
              <div className="space-y-3">
                {userEmojis.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.emoji}</span>
                      <span className="font-semibold">{item.count} times</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-3">
                      <div
                        className={`${barColor} h-3 rounded-full`}
                        style={{
                          width: `${
                            maxCount ? (item.count / maxCount) * 100 : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 