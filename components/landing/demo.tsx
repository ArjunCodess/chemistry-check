"use client";

import { InterestPercentageCard } from "@/components/dashboard/ai-insights/interest-percentage-card";
import { ChatStats } from "@/types";

export default function Demo() {
  const mockStats: ChatStats = {
    totalMessages: 243,
    messagesByUser: { You: 137, Them: 106 },
    totalWords: 2481,
    wordsByUser: { You: 1589, Them: 892 },
    mostUsedWords: [],
    mostUsedEmojis: [],
    wordFrequency: {},
    emojiFrequency: {},
    responseTimes: {},
    mediaStats: {
      total: 0,
      byType: {
        images: 0,
        videos: 0,
        documents: 0,
        stickers: 0,
        animations: 0,
        links: 0,
      },
      totalSize: 0,
      byUser: {},
    },
    emojiStats: {
      frequency: {},
      byUser: {},
      combinations: [],
      sentiment: { positive: 0, negative: 0, neutral: 0 },
    },
    editedMessages: { total: 0, byUser: {} },
    gapTrends: [],
    gapAnalysis: {},
    biggestGaps: [],
    wordFrequencyByUser: {},
    longestMessages: {},
    messagesByHour: {},
    messagesByDay: {},
    messagesByMonth: {},
    sorryByUser: {},
    interestPercentage: {
      "You 💖": {
        score: 85,
        details: {
          initiation: 90,
          responseRate: 95,
          enthusiasm: 85,
          consistency: 80,
        },
      },
      "Them 😐": {
        score: 45,
        details: {
          initiation: 30,
          responseRate: 60,
          enthusiasm: 40,
          consistency: 50,
        },
      },
    },
  };

  return <InterestPercentageCard stats={mockStats} />;
}