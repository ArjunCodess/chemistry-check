interface Message {
  id: number;
  type: string;
  date: string;
  from: string;
  text?: string;
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
}

interface ChatData {
  chat_id: number;
  participants: Record<string, string>;
  messages: Message[];
}

export function parseChatData(data: ChatData) {
  const stats = {
    totalMessages: 0,
    messagesByUser: {} as Record<string, number>,
    totalWords: 0,
    wordsByUser: {} as Record<string, number>,
    mostUsedWords: [] as Array<{ word: string; count: number }>,
    mostUsedEmojis: [] as Array<{ emoji: string; count: number }>,
    wordFrequency: {} as Record<string, number>,
    emojiFrequency: {} as Record<string, number>
  };

  // Process each message
  data.messages.forEach(message => {
    // Skip messages from undefined users
    if (!message.from || message.from === 'undefined') {
      return;
    }

    // Count messages by user
    stats.messagesByUser[message.from] = (stats.messagesByUser[message.from] || 0) + 1;
    stats.totalMessages++;

    // Process text messages
    if (message.type === 'text' && message.text) {
      // Count words
      const words = message.text.split(/\s+/).filter(word => word.length > 0);
      stats.totalWords += words.length;
      stats.wordsByUser[message.from] = (stats.wordsByUser[message.from] || 0) + words.length;

      // Count word frequency
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanWord) {
          stats.wordFrequency[cleanWord] = (stats.wordFrequency[cleanWord] || 0) + 1;
        }
      });

      // Count emoji frequency
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
      const emojis = message.text.match(emojiRegex) || [];
      emojis.forEach(emoji => {
        stats.emojiFrequency[emoji] = (stats.emojiFrequency[emoji] || 0) + 1;
      });
    }

    // Process sticker emojis
    if (message.type === 'sticker' && message.sticker_emoji) {
      stats.emojiFrequency[message.sticker_emoji] = (stats.emojiFrequency[message.sticker_emoji] || 0) + 1;
    }

    // Process reaction emojis
    if (message.type === 'reaction' && message.reaction_emoji) {
      stats.emojiFrequency[message.reaction_emoji] = (stats.emojiFrequency[message.reaction_emoji] || 0) + 1;
    }
  });

  // Convert word frequency to sorted array
  stats.mostUsedWords = Object.entries(stats.wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Convert emoji frequency to sorted array
  stats.mostUsedEmojis = Object.entries(stats.emojiFrequency)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
} 