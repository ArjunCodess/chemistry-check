import { ChatStats } from "@/types";
import { MostUsedEmojisCard } from "./most-used-emojis-card";
import { EmojisByUserCard } from "./emojis-by-user-card";

interface EmojiAnalysisProps {
  stats: ChatStats;
}

export function EmojiAnalysis({ stats }: EmojiAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MostUsedEmojisCard stats={stats} />
        <EmojisByUserCard stats={stats} />
      </div>
    </div>
  );
}