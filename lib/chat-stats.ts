import { ChatStats } from "@/types";

export const createSafeStats = (stats: ChatStats | null): ChatStats => {
  if (!stats) {
    return {
      totalMessages: 0,
      totalWords: 0,
      messagesByUser: {},
      wordsByUser: {},
      messagesByHour: {},
      messagesByDay: {},
      messagesByMonth: {},
      editedMessages: { total: 0, byUser: {} },
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
      mostUsedWords: [],
      mostUsedEmojis: [],
      wordFrequency: {},
      emojiFrequency: {},
      responseTimes: {},
      commonPhrases: [],
      overusedPhrases: {},
      gapTrends: [],
      gapAnalysis: {},
      biggestGaps: [],
      wordFrequencyByUser: {},
      longestMessages: {},
      sorryByUser: {},
    };
  }

  return {
    ...stats,
    totalMessages: stats.totalMessages || 0,
    totalWords: stats.totalWords || 0,
    messagesByUser: stats.messagesByUser || {},
    wordsByUser: stats.wordsByUser || {},
    messagesByHour: stats.messagesByHour || {},
    messagesByDay: stats.messagesByDay || {},
    messagesByMonth: stats.messagesByMonth || {},
    editedMessages: stats.editedMessages || { total: 0, byUser: {} },
    mediaStats: stats.mediaStats || {
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
    emojiStats: stats.emojiStats || {
      frequency: {},
      byUser: {},
      combinations: [],
      sentiment: { positive: 0, negative: 0, neutral: 0 },
    },
    mostUsedWords: stats.mostUsedWords || [],
    mostUsedEmojis: stats.mostUsedEmojis || [],
    wordFrequency: stats.wordFrequency || {},
    emojiFrequency: stats.emojiFrequency || {},
    responseTimes: stats.responseTimes || {},
    commonPhrases: stats.commonPhrases || [],
    overusedPhrases: stats.overusedPhrases || {},
    gapTrends: stats.gapTrends || [],
    gapAnalysis: stats.gapAnalysis || {},
    biggestGaps: stats.biggestGaps || [],
    wordFrequencyByUser: stats.wordFrequencyByUser || {},
    longestMessages: stats.longestMessages || {},
    sorryByUser: stats.sorryByUser || {},
  };
};

export const getMediaByTypeData = (stats: ChatStats) => {
  return [
    { name: "Images", value: stats?.mediaStats?.byType?.images ?? 0 },
    { name: "Videos", value: stats?.mediaStats?.byType?.videos ?? 0 },
    { name: "GIFs", value: stats?.mediaStats?.byType?.animations ?? 0 },
    { name: "Documents", value: stats?.mediaStats?.byType?.documents ?? 0 },
    { name: "Stickers", value: stats?.mediaStats?.byType?.stickers ?? 0 },
    { name: "Links", value: stats?.mediaStats?.byType?.links ?? 0 },
  ].filter((item) => item.value > 0);
}; 