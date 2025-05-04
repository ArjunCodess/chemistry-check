import { Suspense } from "react";
import { ChatStats } from "@/types";
import { OverviewCard } from "./overview-card";
import { MediaStatsCard } from "./media-stats-card";
import { EmojiStatsCard } from "./emoji-stats-card";
import { ResponseStatsCard } from "./response-stats-card";
import { MessagesByUserCard } from "./messages-by-user-card";
import { WordsByUserCard } from "./words-by-user-card";
import { MostUsedWordsCard } from "./most-used-words-card";
import { MostUsedEmojisCard } from "./most-used-emojis-card";
import { WordsByUserDetailedCard } from "./words-by-user-detailed-card";
import { EmojisByUserCard } from "./emojis-by-user-card";
import { LongestMessagesCard } from "./longest-messages-card";

interface BasicStatsProps {
  stats: ChatStats;
  expandedMessages?: Record<string, Record<number, boolean>>;
  toggleMessageExpand?: (user: string, index: number) => void;
}

export function BasicStats({
  stats,
  expandedMessages = {},
  toggleMessageExpand = () => {},
}: BasicStatsProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* First row - Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <OverviewCard stats={stats} />
          <MediaStatsCard stats={stats} />
          <EmojiStatsCard stats={stats} />
          <ResponseStatsCard stats={stats} />
        </div>

        {/* Second row - Messages and Words by User */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MessagesByUserCard stats={stats} />
          <WordsByUserCard stats={stats} />
        </div>

        {/* Third row - Most Used Words and Emojis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MostUsedWordsCard stats={stats} />
          <MostUsedEmojisCard stats={stats} />
          <WordsByUserDetailedCard stats={stats} />
          <EmojisByUserCard stats={stats} />
        </div>

        {/* Fourth row - Longest Messages */}
        <LongestMessagesCard 
          stats={stats} 
          expandedMessages={expandedMessages} 
          toggleMessageExpand={toggleMessageExpand} 
        />
      </div>
    </Suspense>
  );
} 