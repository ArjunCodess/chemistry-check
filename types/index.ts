export interface ResponseTimeStats {
  average: number;
  longest: number;
  distribution: {
    "0-5min": number;
    "5-15min": number;
    "15-30min": number;
    "30min-1hour": number;
    "1hour+": number;
  };
}

export interface MediaStats {
  total: number;
  byType: {
    images: number;
    videos: number;
    documents: number;
    stickers: number;
    animations: number;
    links: number;
  };
  totalSize: number;
  byUser: Record<
    string,
    {
      total: number;
      byType: {
        images: number;
        videos: number;
        documents: number;
        stickers: number;
        animations: number;
        links: number;
      };
      totalSize: number;
    }
  >;
}

export interface EmojiCombination {
  emojis: string[];
  count: number;
}

export interface EmojiStats {
  frequency: Record<string, number>;
  byUser: Record<string, Record<string, number>>;
  combinations: EmojiCombination[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface ChatStats {
  totalMessages: number;
  messagesByUser: Record<string, number>;
  totalWords: number;
  wordsByUser: Record<string, number>;
  mostUsedWords: Array<{ word: string; count: number }>;
  mostUsedEmojis: Array<{ emoji: string; count: number }>;
  responseTimes: Record<string, ResponseTimeStats>;
  mediaStats: MediaStats;
  emojiStats: EmojiStats;
  editedMessages: {
    total: number;
    byUser: Record<string, number>;
  };
  commonPhrases: Array<{ text: string; count: number }>;
  overusedPhrases: Record<string, Array<{ text: string; count: number }>>;
  gapTrends: Array<{ time: string; duration: number }>;
  gapAnalysis: Record<string, Array<{ time: string; duration: number }>>;
  biggestGaps: Array<{ user: string; duration: number; date: string }>;
  wordFrequency: Record<string, number>;
  emojiFrequency: Record<string, number>;
  wordFrequencyByUser: Record<string, Record<string, number>>;
  longestMessages: Record<string, Array<{ text: string; length: number; date: string }>>;
  messagesByHour?: Record<string, number>;
  messagesByDay?: Record<string, number>;
  messagesByMonth?: Record<string, number>;
  sorryByUser?: Record<string, number>;
  aiSummary?: string;
  relationshipHealthScore?: {
    overall: number;
    details: {
      balance: number;
      engagement: number;
      positivity: number;
      consistency: number;
    };
    redFlags?: string[];
  };
  interestPercentage?: Record<string, {
    score: number;
    details: {
      initiation: number;
      responseRate: number;
      enthusiasm: number;
      consistency: number;
    };
  }>;
  cookedStatus?: {
    isCooked: boolean;
    user: string;
    confidence: number;
  };
}