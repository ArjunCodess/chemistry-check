import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface WordsByUserDetailedCardProps {
  stats: ChatStats;
}

export function WordsByUserDetailedCard({ stats }: WordsByUserDetailedCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Used Words by User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(stats.wordsByUser || {}).map((user, userIndex) => {
          // Get words frequency for this specific user
          const userWords = Object.entries(
            stats.wordFrequencyByUser[user] || {}
          )
            .filter(([word]) => word.length > 2) // Filter out short words
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({
              name: word,
              count: count as number,
            }));

          // Find max count for scaling
          const maxCount = userWords.length > 0 ? userWords[0].count : 0;

          // Choose a color based on user index
          const colors = [
            "bg-amber-500",
            "bg-emerald-500",
            "bg-rose-500",
            "bg-indigo-500",
            "bg-fuchsia-500",
          ];
          const barColor = colors[userIndex % colors.length];

          return (
            <div key={`words-${user}`} className="border-b pb-4 last:border-b-0">
              <h3 className="text-lg font-medium mb-3">{user}</h3>
              <div className="space-y-3">
                {userWords.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        &ldquo;{item.name}&rdquo;
                      </span>
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