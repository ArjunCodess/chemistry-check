import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface EmojiStatsCardProps {
  stats: ChatStats;
}

export function EmojiStatsCard({ stats }: EmojiStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emoji Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Unique Emojis:</span>
            <span className="font-semibold">
              {Object.keys(stats?.emojiStats?.frequency || {}).length}
            </span>
          </div>
          {Array.isArray(stats?.mostUsedEmojis) &&
            stats.mostUsedEmojis
              .slice(0, 3)
              .map(({ emoji, count }) => (
                <div key={emoji} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{emoji}:</span>
                  <span className="font-semibold">{count} times</span>
                </div>
              ))}
          {(!Array.isArray(stats?.mostUsedEmojis) ||
            stats.mostUsedEmojis.length === 0) && (
            <div className="text-sm text-gray-500">
              No emoji data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 