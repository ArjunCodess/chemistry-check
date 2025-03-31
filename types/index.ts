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
    reels?: number;
    stories?: number;
    posts?: number;
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
        reels?: number;
        stories?: number;
        posts?: number;
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

export interface WhatsAppMessage {
  date: string;
  sender: string;
  content: string;
  mediaType?: string;
  isReply?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  isSystemMessage?: boolean;
}

export interface TelegramMessage {
  id: number;
  type: string;
  date: string;
  from: string;
  text?: string | Array<{type: string, text: string}>;
  reply_to_message_id?: number;
  edited?: boolean;
  edited_date?: string;
  sticker_emoji?: string;
  sticker_format?: string;
  file_size?: number;
  file_name?: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
  reaction_emoji?: string;
  message_id?: number;
  actor?: string;
  action?: string;
  emoticon?: string;
  file?: boolean;
  media_type?: string;
  mime_type?: string;
  photo?: string;
  photo_file_size?: number;
  thumbnail?: string;
  thumbnail_file_size?: number;
}

export interface TelegramChatData {
  chat_id: number;
  participants: Record<string, string>;
  messages: TelegramMessage[];
}

export interface ChatStats {
  source?: string;
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
  messagesByHour: Record<string, number>;
  messagesByDay: Record<string, number>;
  messagesByMonth: Record<string, number>;
  sorryByUser: Record<string, number>;
  mostApologeticUser?: {
    user: string;
    apologies: number;
    percentage: number;
    mostCommonSorry: string;
  };
  equalApologies?: boolean;
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
  attachmentStyles?: Record<string, AttachmentStyle>;
  matchPercentage?: MatchPercentage;
}

export interface RelationshipHealthScore {
  overall: number;
  details: {
    balance: number;
    engagement: number;
    positivity: number;
    consistency: number;
  };
  redFlags?: string[];
}

export interface InterestPercentage {
  score: number;
  details: {
    initiation: number;
    responseRate: number;
    enthusiasm: number;
    consistency: number;
  };
}

export interface CookedStatus {
  isCooked: boolean;
  user: string;
  confidence: number; // 0-100
}

export interface AttachmentStyle {
  user: string;
  primaryStyle: string;
  secondaryStyle?: string;
  confidence: number; // 0-100
  details: {
    secure: number;
    anxious: number;
    avoidant: number;
    disorganized: number;
  };
  description: string;
}

export interface MatchPercentage {
  score: number; // 0-100
  compatibility: {
    reasons: string[];
    incompatibilities: string[];
  };
  confidence: number; // 0-100
}

export interface InstagramMessage {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  share?: {
    link?: string;
    share_text?: string;
    original_content_owner?: string;
  };
  photos?: Array<{
    uri: string;
    creation_timestamp: number;
  }>;
  reactions?: Array<{
    reaction: string;
    actor: string;
    timestamp: number;
  }>;
  is_geoblocked_for_viewer?: boolean;
  is_unsent_image_by_messenger_kid_parent?: boolean;
}

export interface InstagramChatData {
  participants: Array<{ name: string }>;
  messages: InstagramMessage[];
}