import { Suspense } from "react";
import { ChatStats } from "@/types";
import Masonry from "react-masonry-css";
import { MessagesCountCard } from "./messages-count-card";
import { ResponseTimeCard } from "./response-time-card";
import { InterestLevelCard } from "./interest-level-card";
import { RedFlagsCard } from "./red-flags-card";
import { AttachmentStyleCard } from "./attachment-style-card";
import { TopWordsCard } from "./top-words-card";
import { PersonalityInsightsCard } from "./personality-insights-card";
import { MediaAnalysisCard } from "./media-analysis-card";
import { HighlightStatsCard } from "./highlight-stats-card";
import { ApologyCard } from "./apology-card";
import { RelationshipScoreCard } from "./relationship-score-card";
import { EmojiUsageCard } from "./emoji-usage-card";
import { MessageLengthCard } from "./message-length-card";

interface TLDRProps {
  stats: ChatStats;
}

export function TLDR({ stats }: TLDRProps) {
  const hasResponseTimes = !!stats.responseTimes && Object.keys(stats.responseTimes).length > 0;
  const hasInterestData = !!stats.interestPercentage && Object.keys(stats.interestPercentage).length > 0;
  const hasAttachmentStyles = !!stats.attachmentStyles && Object.keys(stats.attachmentStyles).length > 0;
  const hasWordFrequency = !!stats.wordFrequency && Object.keys(stats.wordFrequency).length > 0;
  const hasMediaStats = !!stats.mediaStats && stats.mediaStats.total > 0;
  const hasEmojiStats = !!stats.emojiStats && Object.keys(stats.emojiStats.frequency).length > 0;
  const hasApologyStats = !!stats.sorryByUser && Object.keys(stats.sorryByUser).length > 0;
  const hasRelationshipScore = !!stats.relationshipHealthScore?.overall;
  const hasLongMessages = !!stats.longestMessages && Object.keys(stats.longestMessages).length > 0;

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    900: 2,
    700: 1,
  };

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-2xl w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-8 bg-gray-200 rounded-2xl w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      }
    >
      <div className="mb-6 h-full">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {/* Core Stats */}
          <div className="masonry-item">
            <MessagesCountCard stats={stats} />
          </div>

          {hasResponseTimes && (
            <div className="masonry-item">
              <ResponseTimeCard stats={stats} />
            </div>
          )}

          {hasInterestData && (
            <div className="masonry-item">
              <InterestLevelCard stats={stats} />
            </div>
          )}

          <div className="masonry-item">
            <RedFlagsCard stats={stats} />
          </div>

          {hasAttachmentStyles && (
            <div className="masonry-item">
              <AttachmentStyleCard stats={stats} />
            </div>
          )}

          {hasWordFrequency && (
            <div className="masonry-item">
              <TopWordsCard stats={stats} />
            </div>
          )}

          {hasAttachmentStyles && (
            <div className="masonry-item">
              <PersonalityInsightsCard stats={stats} />
            </div>
          )}

          {hasMediaStats && (
            <div className="masonry-item">
              <MediaAnalysisCard stats={stats} />
            </div>
          )}

          <div className="masonry-item">
            <HighlightStatsCard stats={stats} />
          </div>

          {hasApologyStats && (
            <div className="masonry-item">
              <ApologyCard stats={stats} />
            </div>
          )}

          {hasRelationshipScore && (
            <div className="masonry-item">
              <RelationshipScoreCard stats={stats} />
            </div>
          )}

          {hasEmojiStats && (
            <div className="masonry-item">
              <EmojiUsageCard stats={stats} />
            </div>
          )}

          {hasLongMessages && (
            <div className="masonry-item">
              <MessageLengthCard stats={stats} />
            </div>
          )}
        </Masonry>
      </div>
    </Suspense>
  );
}