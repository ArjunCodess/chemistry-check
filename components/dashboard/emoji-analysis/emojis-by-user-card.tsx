import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface EmojisByUserCardProps {
  stats: ChatStats;
}

export function EmojisByUserCard({ stats }: EmojisByUserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emoji Usage by User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(stats?.emojiStats?.byUser || {}).map(
            ([user, emojis]) => (
              <div key={user} className="border-b pb-4 last:border-b-0">
                <h3 className="text-lg font-medium mb-2">{user}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(emojis || {})
                    .sort(
                      ([, countA], [, countB]) =>
                        Number(countB) - Number(countA)
                    )
                    .slice(0, 6)
                    .map(([emoji, count]) => (
                      <div
                        key={emoji}
                        className="flex flex-col items-center p-2 bg-neutral-50 rounded-lg"
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs text-neutral-500">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}