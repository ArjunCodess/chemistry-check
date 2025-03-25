import { WhatsAppMessage, ChatStats } from '@/types';

export async function parseChatData(rawText: string): Promise<ChatStats> {
  const stats: ChatStats = {
    source: "whatsapp",
    totalMessages: 0,
    messagesByUser: {},
    totalWords: 0,
    wordsByUser: {},
    mostUsedWords: [],
    mostUsedEmojis: [],
    responseTimes: {},
    mediaStats: {
      total: 0,
      byType: {
        images: 0,
        videos: 0,
        documents: 0,
        stickers: 0,
        animations: 0,
        links: 0
      },
      totalSize: 0, // Will be ignored for WhatsApp
      byUser: {}
    },
    emojiStats: {
      frequency: {},
      byUser: {},
      combinations: [],
      sentiment: { positive: 0, negative: 0, neutral: 0 }
    },
    editedMessages: {
      total: 0,
      byUser: {}
    },
    commonPhrases: [],
    overusedPhrases: {},
    gapTrends: [],
    gapAnalysis: {},
    biggestGaps: [],
    wordFrequency: {},
    emojiFrequency: {},
    wordFrequencyByUser: {},
    messagesByHour: {},
    messagesByDay: {},
    messagesByMonth: {},
    sorryByUser: {},
    longestMessages: {},
    equalApologies: false,
    mostApologeticUser: undefined
  };
  
  console.log("Starting to parse WhatsApp chat data...");
  
  try {
    if (!rawText || typeof rawText !== 'string') {
      console.error("Invalid WhatsApp chat data format - expected a string");
      return stats;
    }
    
    // Parse raw text into messages
    const messages = parseWhatsAppText(rawText);
    console.log(`Parsed ${messages.length} messages from WhatsApp chat`);
    
    // Filter out system messages from statistical analysis
    const userMessages = messages.filter(message => !message.isSystemMessage);
    console.log(`Found ${userMessages.length} user messages and ${messages.length - userMessages.length} system messages`);
    
    // Initialize time-based pattern tracking
    // Initialize hours (0-23)
    for (let hour = 0; hour < 24; hour++) {
      stats.messagesByHour[hour.toString()] = 0;
    }
    
    // Initialize days of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysOfWeek.forEach(day => {
      stats.messagesByDay[day] = 0;
    });
    
    // Map to track months (just month name, regardless of year)
    const monthsMap = new Map<string, number>();
    
    // Store user word frequencies
    const wordFrequencyByUser: Record<string, Record<string, number>> = {};
    
    // Process each message - now use userMessages instead of all messages
    userMessages.forEach((message, index) => {
      if (!message.sender) {
        console.log(`Skipping message with unknown sender at index ${index}`);
        return;
      }
      
      // Count messages by user
      const user = message.sender;
      stats.messagesByUser[user] = (stats.messagesByUser[user] || 0) + 1;
      stats.totalMessages++;
      
      // Initialize word frequency map for user if needed
      if (!wordFrequencyByUser[user]) {
        wordFrequencyByUser[user] = {};
      }
      
      // Track message activity patterns
      if (message.date) {
        try {
          const messageDate = new Date(message.date);
          
          // Track by hour of day (0-23)
          const hour = messageDate.getHours();
          stats.messagesByHour[hour.toString()] = (stats.messagesByHour[hour.toString()] || 0) + 1;
          
          // Track by day of week (0-6, starting from Sunday)
          const dayOfWeek = daysOfWeek[messageDate.getDay()];
          stats.messagesByDay[dayOfWeek] = (stats.messagesByDay[dayOfWeek] || 0) + 1;
          
          // Track by month name only (without the year)
          const monthName = messageDate.toLocaleDateString('en-US', { month: 'long' });
          monthsMap.set(monthName, (monthsMap.get(monthName) || 0) + 1);
        } catch (error) {
          console.error("Error processing message date:", error);
        }
      }
      
      // Process message content if available
      if (message.content) {
        // Skip system messages or detect if this is a special message
        if (message.content.includes('Media omitted')) {
          // Track media message
          processMediaMessage(message, stats);
          return;
        }
        
        // Check if message is edited
        const isEdited = message.isEdited || message.content.includes('<This message was edited>');
        if (isEdited) {
          stats.editedMessages.total++;
          stats.editedMessages.byUser[user] = (stats.editedMessages.byUser[user] || 0) + 1;
        }
        
        // Check if message is deleted
        if (message.isDeleted || message.content.includes('This message was deleted')) {
          return; // Skip further processing for deleted messages
        }
        
        // Count words
        const words = message.content
          .trim()
          .split(/\s+/)
          .filter(Boolean); // Remove empty strings
        
        const wordCount = words.length;
        
        if (wordCount > 0) {
          stats.totalWords += wordCount;
          
          // Track by user
          stats.wordsByUser[user] = (stats.wordsByUser[user] || 0) + wordCount;
          
          // Store the complete message text for longest messages
          if (!stats.longestMessages[user]) {
            stats.longestMessages[user] = [];
          }
          
          const messageDate = message.date ? new Date(message.date).toLocaleDateString() : 'Unknown date';
          
          // Add this message to the user's list
          stats.longestMessages[user].push({
            text: message.content,
            length: wordCount,
            date: messageDate
          });
          
          // Sort messages by length (descending) and keep only top 3
          stats.longestMessages[user].sort((a, b) => b.length - a.length);
          if (stats.longestMessages[user].length > 3) {
            stats.longestMessages[user] = stats.longestMessages[user].slice(0, 3);
          }
          
          // Count word frequency
          words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
            if (cleanWord && cleanWord.length > 0) {
              // Track global word frequency
              stats.wordFrequency[cleanWord] = (stats.wordFrequency[cleanWord] || 0) + 1;
              
              // Track word frequency by user
              wordFrequencyByUser[user][cleanWord] = (wordFrequencyByUser[user][cleanWord] || 0) + 1;
            }
          });
        }
        
        // Check for sorry/apologies
        const normalizedText = message.content.toLowerCase().trim();
        
        // Filter out special WhatsApp messages before checking for apologies
        if (
          normalizedText === "this message was deleted" || 
          normalizedText === "you deleted this message" ||
          normalizedText.includes("<this message was edited>") ||
          normalizedText === "<media omitted>" ||
          normalizedText.includes("media omitted")
        ) {
          return; // Skip these special message types
        }
        
        if (normalizedText.includes('sorry') || 
            normalizedText.includes('apolog') || 
            normalizedText.includes('regret') || 
            normalizedText.includes('forgive') ||
            normalizedText.includes('my bad') ||
            normalizedText.includes('my fault')) {
          stats.sorryByUser[user] = (stats.sorryByUser[user] || 0) + 1;
        }
        
        // Process emojis
        processEmojis(message.content, user, stats);
        
        // Process links
        if (message.content.includes('http://') || message.content.includes('https://')) {
          if (!stats.mediaStats.byUser[user]) {
            stats.mediaStats.byUser[user] = {
              total: 0,
              byType: {
                images: 0,
                videos: 0,
                documents: 0,
                stickers: 0,
                animations: 0,
                links: 0
              },
              totalSize: 0
            };
          }
          
          stats.mediaStats.total++;
          stats.mediaStats.byType.links++;
          stats.mediaStats.byUser[user].total++;
          stats.mediaStats.byUser[user].byType.links++;
        }
      }
    });
    
    // Convert month data to record - sort by natural month order
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Add months in natural order
    monthOrder.forEach(month => {
      const count = monthsMap.get(month) || 0;
      if (count > 0) {
        stats.messagesByMonth[month] = count;
      }
    });
    
    // Assign word frequency by user to stats
    stats.wordFrequencyByUser = wordFrequencyByUser;
    
    // Convert word frequency to sorted array
    stats.mostUsedWords = Object.entries(stats.wordFrequency)
      .filter(([word]) => word.length > 2) // Filter out short words
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Convert emoji frequency to sorted array
    stats.mostUsedEmojis = Object.entries(stats.emojiFrequency)
      .filter(([emoji]) => {
        // Additional filtering to remove any remaining numbers or basic characters
        return !/^\d$/.test(emoji) && 
               !/^[a-zA-Z]$/.test(emoji) && 
               !/^[.,!?;:\-_'"()[\]{}]$/.test(emoji);
      })
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate response statistics and gap analysis
    calculateResponsesAndGaps(userMessages, stats);
    
    // Analyze phrases for common and overused expressions
    analyzePhrases(userMessages, stats);
    
    console.log("WhatsApp chat parsing completed with:", {
      totalMessages: stats.totalMessages,
      messagesByUser: stats.messagesByUser,
      totalWords: stats.totalWords,
      wordsByUser: stats.wordsByUser
    });
    
    // Add info about the WhatsApp Group
    try {
      // Extract group info from the first few system messages if available
      const systemMessages = messages.filter(message => message.isSystemMessage);
      if (systemMessages.length > 0) {
        // Group information is often in first system message
        const groupInfoMessage = systemMessages[0];
        // We could extract group information here but we're just logging for now
        console.log(`WhatsApp chat may be from group: ${groupInfoMessage.content}`);
      }
    } catch (error) {
      console.error("Error processing group info:", error);
    }
    
    // Add AI insights
    try {
      console.log("Generating AI insights for WhatsApp chat...");
      const aiInsights = await generateAIInsights(userMessages, stats);
      
      // Add AI insights to the stats object
      stats.aiSummary = aiInsights.aiSummary;
      stats.relationshipHealthScore = aiInsights.relationshipHealthScore;
      stats.interestPercentage = aiInsights.interestPercentage;
      stats.cookedStatus = aiInsights.cookedStatus;
      
      console.log("AI insights generated successfully for WhatsApp chat");
    } catch (error) {
      console.error("Error generating AI insights for WhatsApp chat:", error);
    }
    
    return stats;
  } catch (error) {
    console.error("Error parsing WhatsApp chat data:", error);
    return stats;
  }
}

// Helper function to parse WhatsApp text export into structured messages
function parseWhatsAppText(text: string): WhatsAppMessage[] {
  const lines = text.split('\n');
  const messages: WhatsAppMessage[] = [];
  let currentMessage: WhatsAppMessage | null = null;
  
  // More flexible regex patterns to handle various WhatsApp export formats
  // Format 1: "26/11/24, 9:54 pm - arjuncodess: prinout nikava de."
  // Format 2: "26/11/24, 9:54 - arjuncodess: prinout nikava de." (no am/pm)
  // Format 3: "11/26/2024, 21:54 - arjuncodess: prinout nikava de." (24-hour format)
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})),\s(\d{1,2}:\d{1,2}(?:\s?[ap]m)?)\s-\s([^:]+):\s(.*)$/i;
  
  // System message regex (also more flexible)
  const systemMessageRegex = /^(\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})),\s(\d{1,2}:\d{1,2}(?:\s?[ap]m)?)\s-\s(.+)$/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Try to match standard message format
      const messageMatch = line.match(messageRegex);
      if (messageMatch) {
        // If we have a current message in progress, save it
        if (currentMessage) {
          messages.push(currentMessage);
        }
        
        // Extract date components
        const datePart = messageMatch[1]; // e.g., "26/11/24"
        const timePart = messageMatch[2]; // e.g., "9:54 pm"
        
        // Parse date first
        let day, month, year;
        
        if (datePart.includes('/')) {
          const datePieces = datePart.split('/');
          
          // Handle DD/MM/YYYY format as specified by user
          if (datePieces.length === 3) {
            // Always use DD/MM/YYYY format
            day = datePieces[0];
            month = datePieces[1];
            year = datePieces[2];
            
            // Ensure year is 4 digits
            if (year.length === 2) {
              year = '20' + year; // Assuming all dates are from 2000s or later
            }
          } else {
            // Invalid date format, use current date as fallback
            const now = new Date();
            day = now.getDate().toString();
            month = (now.getMonth() + 1).toString();
            year = now.getFullYear().toString();
            console.warn(`Invalid date format: ${datePart}, using current date as fallback`);
          }
        } else {
          // Invalid date format, use current date as fallback
          const now = new Date();
          day = now.getDate().toString();
          month = (now.getMonth() + 1).toString();
          year = now.getFullYear().toString();
          console.warn(`Invalid date format: ${datePart}, using current date as fallback`);
        }
        
        // Process time part with better detection for 24h or 12h format
        let hour = 0;
        let minute = 0;
        
        if (timePart) {
          // Check if time is in 12h or 24h format
          const has12HourFormat = /am|pm/i.test(timePart);
          
          if (has12HourFormat) {
            // 12-hour format "9:54 pm"
            const [hourMinute, ampm] = timePart.split(/\s+/);
            if (hourMinute && hourMinute.includes(':')) {
              const [hourStr, minuteStr] = hourMinute.split(':');
              hour = parseInt(hourStr, 10) || 0;
              minute = parseInt(minuteStr, 10) || 0;
              
              // Convert to 24-hour format
              if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
              } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
                hour = 0;
              }
            }
          } else {
            // 24-hour format "21:54"
            if (timePart.includes(':')) {
              const [hourStr, minuteStr] = timePart.split(':');
              hour = parseInt(hourStr, 10) || 0;
              minute = parseInt(minuteStr, 10) || 0;
            }
          }
        }
        
        // Ensure values are within valid ranges
        hour = Math.min(Math.max(hour, 0), 23);
        minute = Math.min(Math.max(minute, 0), 59);
        
        // Construct ISO date string
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        
        // Create new message
        const messageContent = messageMatch[4];
        const isEditedMessage = messageContent.includes('<This message was edited>');
        const isDeletedMessage = messageContent.includes('This message was deleted');
        
        currentMessage = {
          date: isoDate,
          sender: messageMatch[3].trim(),
          content: messageContent,
          isEdited: isEditedMessage,
          isDeleted: isDeletedMessage
        };
        
        // Check for media messages
        if (currentMessage.content.includes('<Media omitted>') || currentMessage.content.includes('Media omitted')) {
          currentMessage.mediaType = 'unknown';
        }
        
        // Continue to next line
        continue;
      }
      
      // Try to match system message
      const systemMatch = line.match(systemMessageRegex);
      if (systemMatch) {
        // Process system message (group notifications, etc.) similar to above
        // but simplified since we don't need full content parsing
        const datePart = systemMatch[1]; 
        const timePart = systemMatch[2];
        
        // Parse date
        let day, month, year;
        if (datePart.includes('/')) {
          const datePieces = datePart.split('/');
          if (datePieces.length === 3) {
            // Always use DD/MM/YYYY format
            day = datePieces[0];
            month = datePieces[1]; 
            year = datePieces[2];
            
            if (year.length === 2) {
              year = '20' + year;
            }
          } else {
            const now = new Date();
            day = now.getDate().toString();
            month = (now.getMonth() + 1).toString();
            year = now.getFullYear().toString();
          }
        } else {
          const now = new Date();
          day = now.getDate().toString();
          month = (now.getMonth() + 1).toString();
          year = now.getFullYear().toString();
        }
        
        // Process time
        let hour = 0;
        let minute = 0;
        
        if (timePart) {
          const has12HourFormat = /am|pm/i.test(timePart);
          
          if (has12HourFormat) {
            const parts = timePart.split(/\s+/);
            const hourMinute = parts[0];
            const ampm = parts.length > 1 ? parts[1] : null;
            
            if (hourMinute && hourMinute.includes(':')) {
              const [hourStr, minuteStr] = hourMinute.split(':');
              hour = parseInt(hourStr, 10) || 0;
              minute = parseInt(minuteStr, 10) || 0;
              
              if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
              } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
                hour = 0;
              }
            }
          } else {
            if (timePart.includes(':')) {
              const [hourStr, minuteStr] = timePart.split(':');
              hour = parseInt(hourStr, 10) || 0;
              minute = parseInt(minuteStr, 10) || 0;
            }
          }
        }
        
        hour = Math.min(Math.max(hour, 0), 23);
        minute = Math.min(Math.max(minute, 0), 59);
        
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        
        // Create system message but don't mark it explicitly as "System" sender
        const systemMessage: WhatsAppMessage = {
          date: isoDate,
          sender: '', // Empty sender instead of 'System'
          content: systemMatch[3],
          isSystemMessage: true // Flag it as system message for reference
        };
        
        messages.push(systemMessage);
        currentMessage = null;
        continue;
      }
      
      // If neither regex matched, it might be a continuation of the previous message
      if (currentMessage) {
        currentMessage.content += '\n' + line;
      }
    } catch (error) {
      console.error(`Error parsing line ${i}: ${line}`, error);
      // Continue processing other messages
      continue;
    }
  }
  
  // Add the last message if exists
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

// Helper function to process media messages - simplified for WhatsApp
function processMediaMessage(message: WhatsAppMessage, stats: ChatStats): void {
  const user = message.sender;
  
  // Initialize media stats for user if needed
  if (!stats.mediaStats.byUser[user]) {
    stats.mediaStats.byUser[user] = {
      total: 0,
      byType: {
        images: 0, 
        videos: 0,
        documents: 0, // We'll use this for all media in WhatsApp (as "Other Media" in UI)
        stickers: 0,
        animations: 0,
        links: 0
      },
      totalSize: 0  // Not used for WhatsApp
    };
  }
  
  // Update media stats - combine all media as "documents" (will be "Other Media" in UI)
  stats.mediaStats.total++;
  stats.mediaStats.byUser[user].total++;
  
  // For WhatsApp, we count all media as "documents" (will be "Other Media" in UI)
  stats.mediaStats.byType.documents++;
  stats.mediaStats.byUser[user].byType.documents++;
  
  // Zero out other media types to ensure they aren't used in the UI
  stats.mediaStats.byType.images = 0;
  stats.mediaStats.byType.videos = 0;
  stats.mediaStats.byType.stickers = 0;
  stats.mediaStats.byType.animations = 0;
}

// Helper function to process emojis in message content
function processEmojis(content: string, user: string, stats: ChatStats): void {
  try {
    // Emoji regex pattern
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    
    const emojis = content.match(emojiRegex);
    
    if (emojis && emojis.length > 0) {
      emojis.forEach(emoji => {
        // Skip if emoji is actually a number or basic punctuation
        if (/^\d$/.test(emoji) || /^[.,!?;:\-_'"()[\]{}]$/.test(emoji)) {
          return;
        }
        
        // Update global emoji frequency
        stats.emojiFrequency[emoji] = (stats.emojiFrequency[emoji] || 0) + 1;
        
        // Initialize user's emoji stats if needed
        if (!stats.emojiStats.byUser[user]) {
          stats.emojiStats.byUser[user] = {};
        }
        
        // Update user-specific emoji frequency
        stats.emojiStats.frequency[emoji] = (stats.emojiStats.frequency[emoji] || 0) + 1;
        stats.emojiStats.byUser[user][emoji] = (stats.emojiStats.byUser[user][emoji] || 0) + 1;
      });
    }
  } catch (error) {
    console.error("Error processing emojis:", error);
  }
}

// Helper function to calculate response statistics and gap analysis
function calculateResponsesAndGaps(messages: WhatsAppMessage[], stats: ChatStats): void {
  console.log(`Calculating response times for ${messages.length} messages`);
  
  const userResponseTimes: Record<string, number[]> = {};
  const userGapTimes: Record<string, Array<{ time: string; duration: number }>> = {};
  const allGapTimes: Array<{ time: string; duration: number }> = [];
  const biggestGaps: Array<{ user: string; duration: number; date: string }> = [];

  // Initialize response time stats for each user
  Object.keys(stats.messagesByUser).forEach(user => {
    stats.responseTimes[user] = {
      average: 0,
      longest: 0,
      distribution: {
        '0-5min': 0,
        '5-15min': 0,
        '15-30min': 0,
        '30min-1hour': 0,
        '1hour+': 0
      }
    };
    userResponseTimes[user] = [];
    userGapTimes[user] = [];
  });

  // First, validate all date strings and sort messages by date
  const validMessages = messages.filter(msg => {
    if (!msg.date) return false;
    
    // Validate date to ensure it's parseable
    try {
      const date = new Date(msg.date);
      return !isNaN(date.getTime());
    } catch {
      console.error("Invalid date found:", msg.date);
      return false;
    }
  });
  
  // Sort messages chronologically
  const sortedMessages = [...validMessages].sort((a, b) => {
    const dateA = new Date(a.date!);
    const dateB = new Date(b.date!);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log(`Sorted ${sortedMessages.length} valid messages chronologically`);

  // Process messages to calculate response times
  for (let i = 1; i < sortedMessages.length; i++) {
    const prevMsg = sortedMessages[i-1];
    const currMsg = sortedMessages[i];
    
    // Skip if either message is missing required data
    if (!prevMsg.sender || !currMsg.sender || prevMsg.sender === currMsg.sender) {
      continue;
    }
    
    // Calculate the gap in minutes
    const prevDate = new Date(prevMsg.date!);
    const currDate = new Date(currMsg.date!);
    const diffInMs = currDate.getTime() - prevDate.getTime();
    
    // Log for debugging negative times
    if (diffInMs < 0) {
      console.warn("Negative time gap detected despite sorting:", {
        prev: prevMsg.date,
        curr: currMsg.date,
        diffMs: diffInMs,
        diffMin: diffInMs / (1000 * 60)
      });
    }
    
    // Ensure we're always getting a positive value
    const diffInMin = Math.max(0, diffInMs) / (1000 * 60);
    
    // Skip if unreasonable gap (24 hours or more) - likely not a direct response
    if (diffInMin > 24 * 60) {
      continue;
    }
    
    const user = currMsg.sender;
    if (!userResponseTimes[user]) continue;
    
    // Record the response time
    userResponseTimes[user].push(diffInMin);
    
    // Add to gap analysis data
    const timeStr = currDate.toISOString().split('T')[0]; // YYYY-MM-DD
    userGapTimes[user].push({ time: timeStr, duration: diffInMin });
    allGapTimes.push({ time: timeStr, duration: diffInMin });
    
    // Categorize response time
    if (diffInMin <= 5) {
      stats.responseTimes[user].distribution['0-5min']++;
    } else if (diffInMin <= 15) {
      stats.responseTimes[user].distribution['5-15min']++;
    } else if (diffInMin <= 30) {
      stats.responseTimes[user].distribution['15-30min']++;
    } else if (diffInMin <= 60) {
      stats.responseTimes[user].distribution['30min-1hour']++;
    } else {
      stats.responseTimes[user].distribution['1hour+']++;
    }
    
    // Track biggest gaps
    if (biggestGaps.length < 10 || diffInMin > biggestGaps[biggestGaps.length - 1].duration) {
      const gapRecord = {
        user,
        duration: diffInMin,
        date: currDate.toISOString()
      };
      
      // Insert into sorted array
      biggestGaps.push(gapRecord);
      biggestGaps.sort((a, b) => b.duration - a.duration);
      
      // Keep only top 10
      if (biggestGaps.length > 10) {
        biggestGaps.pop();
      }
    }
  }

  // Calculate average and longest response times
  Object.keys(userResponseTimes).forEach(user => {
    const times = userResponseTimes[user];
    if (times.length > 0) {
      // Calculate average - log for debugging
      const sum = times.reduce((sum, time) => sum + time, 0);
      const avg = sum / times.length;
      console.log(`User ${user} response times: count=${times.length}, sum=${sum}, avg=${avg}`);
      
      stats.responseTimes[user].average = avg;
      
      // Find longest
      stats.responseTimes[user].longest = Math.max(...times);
    }
  });

  // Assign gap analysis data to stats
  stats.gapTrends = allGapTimes;
  stats.gapAnalysis = userGapTimes;
  stats.biggestGaps = biggestGaps;
  
  // Process apologies data
  const users = Object.keys(stats.sorryByUser);
  
  // Check if we have exactly two users
  if (users.length === 2) {
    const sorryCount1 = stats.sorryByUser[users[0]] || 0;
    const sorryCount2 = stats.sorryByUser[users[1]] || 0;
    
    // Check if apologies are equal
    stats.equalApologies = sorryCount1 === sorryCount2 && sorryCount1 > 0;
    
    if (!stats.equalApologies && (sorryCount1 > 0 || sorryCount2 > 0)) {
      // Determine who apologizes more
      const mostApologeticUser = sorryCount1 > sorryCount2 ? users[0] : users[1];
      const apologies = Math.max(sorryCount1, sorryCount2);
      const totalApologies = sorryCount1 + sorryCount2;
      const percentage = Math.round((apologies / totalApologies) * 100);
      
      // Set mostApologeticUser with extended info
      stats.mostApologeticUser = {
        user: mostApologeticUser,
        apologies: apologies,
        percentage: percentage,
        mostCommonSorry: "Sorry" // Default value, we could analyze this further
      };
    }
  } else if (users.length === 1 && stats.sorryByUser[users[0]] > 0) {
    // Only one user apologizes
    stats.mostApologeticUser = {
      user: users[0],
      apologies: stats.sorryByUser[users[0]],
      percentage: 100,
      mostCommonSorry: "Sorry" // Default value
    };
  }
  
  // If equal apologies, ensure mostApologeticUser is null
  if (stats.equalApologies) {
    stats.mostApologeticUser = undefined;
  }
}

// Helper function to analyze phrases
function analyzePhrases(messages: WhatsAppMessage[], stats: ChatStats): void {
  // Minimum phrase length to consider (in words)
  const MIN_PHRASE_LENGTH = 2;
  // Maximum phrase length to analyze
  const MAX_PHRASE_LENGTH = 5;
  // Minimum occurrences to be considered common
  const MIN_OCCURRENCES = 3;
  // Minimum occurrences for user-specific phrases to be considered overused
  const MIN_USER_OCCURRENCES = 3;

  // Initialize phrase counters
  const phraseCounts: Record<string, number> = {};
  const userPhraseCounts: Record<string, Record<string, number>> = {};
  
  // Get list of users
  const users = Object.keys(stats.messagesByUser);
  
  // Initialize user phrase counts
  users.forEach(user => {
    userPhraseCounts[user] = {};
  });

  // Process each message with text content
  messages.forEach(message => {
    if (!message || !message.sender || !message.content) return;
    
    const user = message.sender;
    if (!userPhraseCounts[user]) return; // Skip if user not in our tracking list
    
    const text = message.content;
    if (!text || text.trim().length === 0) return;
    
    // Filter out special WhatsApp messages
    if (
      text === "This message was deleted" || 
      text === "You deleted this message" ||
      text.includes("<This message was edited>") ||
      text === "<Media omitted>" ||
      text.includes("Media omitted")
    ) {
      return; // Skip these special message types
    }
    
    // Normalize text: lowercase and remove extra whitespace
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Skip phrases that contain links for phrase analysis
    if (normalizedText.includes("http://") || normalizedText.includes("https://")) {
      return;
    }
    
    // Split into words
    const words = normalizedText.split(' ');
    
    // Skip if too few words
    if (words.length < MIN_PHRASE_LENGTH) return;
    
    // Extract phrases of different lengths
    for (let phraseLength = MIN_PHRASE_LENGTH; phraseLength <= MAX_PHRASE_LENGTH; phraseLength++) {
      // Skip if message is shorter than current phrase length
      if (words.length < phraseLength) continue;
      
      // Extract all possible phrases of current length
      for (let i = 0; i <= words.length - phraseLength; i++) {
        const phrase = words.slice(i, i + phraseLength).join(' ');
        
        // Skip extremely short phrases or phrases containing just special characters/numbers
        if (phrase.length < 4 || /^[\d\s.,!?;:'"()\[\]{}]+$/.test(phrase)) continue;
        
        // Update global phrase count
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        
        // Update user-specific phrase count
        userPhraseCounts[user][phrase] = (userPhraseCounts[user][phrase] || 0) + 1;
      }
    }
  });

  // Filter out subset phrases with identical counts
  const filteredPhraseCounts = filterSubsetPhrases(phraseCounts);
  
  // Extract common phrases (used by anyone)
  const commonPhrases = Object.entries(filteredPhraseCounts)
    .filter(([, count]) => count >= MIN_OCCURRENCES)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 common phrases

  // Extract overused phrases per user
  const overusedPhrases: Record<string, Array<{ text: string; count: number }>> = {};
  
  users.forEach(user => {
    // Filter subset phrases for this user
    const filteredUserPhrases = filterSubsetPhrases(userPhraseCounts[user]);
    
    // Get all phrases used by this user with minimum occurrences
    const userPhrases = Object.entries(filteredUserPhrases)
      .filter(([, count]) => count >= MIN_USER_OCCURRENCES)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);
    
    // Only keep phrases that are significantly used by this user
    const significantPhrases = userPhrases.filter(({ text, count }) => {
      const totalUsage = filteredPhraseCounts[text] || count;
      const userPercentage = count / totalUsage;
      
      // If user accounts for 70%+ of the phrase usage and used it at least MIN_USER_OCCURRENCES times
      return userPercentage >= 0.7 && count >= MIN_USER_OCCURRENCES;
    });
    
    if (significantPhrases.length > 0) {
      overusedPhrases[user] = significantPhrases.slice(0, 10); // Top 10 overused phrases per user
    }
  });

  // Store results in stats
  stats.commonPhrases = commonPhrases;
  stats.overusedPhrases = overusedPhrases;
}

/**
 * Filters out subset phrases that have the same occurrence count as their containing phrases
 * For example, if "night" and "good night" both have 10 occurrences, we only keep "good night"
 */
function filterSubsetPhrases(phraseCounts: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Group phrases by count to find potential subsets
  const phrasesByCount: Record<number, string[]> = {};
  
  // Sort phrases by length (longest first) so we process longer phrases before shorter ones
  const phrases = Object.keys(phraseCounts).sort((a, b) => b.length - a.length);
  
  for (const phrase of phrases) {
    const count = phraseCounts[phrase];
    if (!phrasesByCount[count]) {
      phrasesByCount[count] = [];
    }
    phrasesByCount[count].push(phrase);
  }
  
  // Filter subsets within each count group
  Object.entries(phrasesByCount).forEach(([countStr, phrasesWithCount]) => {
    const count = parseInt(countStr);
    
    // If only one phrase has this count, add it directly
    if (phrasesWithCount.length === 1) {
      result[phrasesWithCount[0]] = count;
      return;
    }
    
    // Sort phrases by length (longest first)
    const sortedPhrases = phrasesWithCount.sort((a, b) => b.length - a.length);
    
    // Track which phrases to include
    const includePhrases = new Set(sortedPhrases);
    
    // Check for subset relationships
    for (let i = 0; i < sortedPhrases.length; i++) {
      const phrase = sortedPhrases[i];
      if (!includePhrases.has(phrase)) continue;
      
      for (let j = i + 1; j < sortedPhrases.length; j++) {
        const potentialSubset = sortedPhrases[j];
        
        // Skip if already marked for exclusion
        if (!includePhrases.has(potentialSubset)) continue;
        
        // If the longer phrase includes the shorter phrase, mark the shorter phrase for exclusion
        if (phrase.includes(potentialSubset)) {
          includePhrases.delete(potentialSubset);
        }
      }
    }
    
    // Add all included phrases to the result
    for (const phrase of includePhrases) {
      result[phrase] = count;
    }
  });
  
  return result;
}

// Function to call Gemini API for generating AI insights for WhatsApp
async function generateAIInsights(messages: WhatsAppMessage[], stats: ChatStats): Promise<{
  aiSummary: string;
  relationshipHealthScore: {
    overall: number;
    details: {
      balance: number;
      engagement: number;
      positivity: number;
      consistency: number;
    };
    redFlags?: string[];
  };
  interestPercentage: Record<string, {
    score: number;
    details: {
      initiation: number;
      responseRate: number;
      enthusiasm: number;
      consistency: number;
    };
  }>;
  cookedStatus: {
    isCooked: boolean;
    user: string;
    confidence: number;
  };
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return getDefaultAIInsights(stats);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
    
    // Create a summary of the chat data to send to the API
    const chatSummary = {
      source: "whatsapp",
      totalMessages: stats.totalMessages,
      messagesByUser: stats.messagesByUser,
      totalWords: stats.totalWords,
      wordsByUser: stats.wordsByUser,
      mostUsedWords: stats.mostUsedWords?.slice(0, 10),
      mostUsedEmojis: stats.mostUsedEmojis?.slice(0, 10),
      responseTimes: stats.responseTimes,
      commonPhrases: stats.commonPhrases?.slice(0, 10),
      overusedPhrases: stats.overusedPhrases,
      biggestGaps: stats.biggestGaps?.slice(0, 5),
      longestMessages: stats.longestMessages,
      messagesByHour: stats.messagesByHour,
      messagesByDay: stats.messagesByDay,
      messagesByMonth: stats.messagesByMonth,
      sorryByUser: stats.sorryByUser,
    };
    
    // Prepare sample messages
    const sampleMessages = messages
      .filter(m => m.content && !m.isSystemMessage && 
        // Filter out special message types
        !m.content.includes('Media omitted') &&
        !m.content.includes('<This message was edited>') &&
        m.content !== 'This message was deleted' &&
        m.content !== 'You deleted this message' &&
        !m.content.includes('http://') &&
        !m.content.includes('https://'))
      .slice(-50) // Get the most recent 50 messages
      .map(m => ({
        from: m.sender,
        text: m.content,
        date: m.date
      }));
    
    // Create the prompt for the AI
    const prompt = `
      You are an expert in analyzing chat conversations. Based on the provided WhatsApp chat statistics and sample messages, please generate:
      
      1. A 3-4 paragraph chat summary that describes the overall relationship dynamics, communication patterns, and whether there are any signs that one person is "cooked" (showing significantly more interest than the other).
      
      2. A relationship health score from 0-100 with detailed subscores for:
         - Balance (equal participation): 0-100
         - Engagement (active participation): 0-100
         - Positivity (positive sentiment): 0-100
         - Consistency (regular communication): 0-100
      
      3. List of potential red flags in the relationship (if any)
      
      4. Interest percentage for each participant on a scale of 0-100, with subscores for:
         - Initiation (who starts conversations): 0-100
         - Response Rate (how quickly/reliably they respond): 0-100
         - Enthusiasm (message length, emoji/media usage): 0-100
         - Consistency (regular participation): 0-100
         
      5. Determine if one user is "cooked" - meaning they're showing much more interest or effort in the conversation than the other. 
         Being "cooked" means they're clearly more invested in the relationship/conversation.
      
      Chat Statistics:
      ${JSON.stringify(chatSummary, null, 2)}
      
      Sample Messages:
      ${JSON.stringify(sampleMessages.filter(m => 
        !m.text.includes('<This message was edited>') &&
        m.text !== 'You deleted this message' &&
        !m.text.includes('<Media omitted>')
      ), null, 2)}
      
      Respond in the following JSON format only:
      {
        "aiSummary": "detailed 3-4 paragraph summary of chat dynamics",
        "relationshipHealthScore": {
          "overall": 75,
          "details": {
            "balance": 80,
            "engagement": 85,
            "positivity": 70,
            "consistency": 65
          },
          "redFlags": ["flag1", "flag2"]
        },
        "interestPercentage": {
          "User1": {
            "score": 85,
            "details": {
              "initiation": 90,
              "responseRate": 80,
              "enthusiasm": 85,
              "consistency": 85
            }
          },
          "User2": {
            "score": 70,
            "details": {
              "initiation": 60,
              "responseRate": 75,
              "enthusiasm": 65,
              "consistency": 80
            }
          }
        },
        "cookedStatus": {
          "isCooked": true,
          "user": "User1",
          "confidence": 90
        }
      }
    `;
    
    // Call the Gemini API
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("Error calling Gemini API:", result);
      return getDefaultAIInsights(stats);
    }
    
    try {
      // Extract the response text from Gemini
      const responseText = result.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      // Use regex to extract the JSON part if needed
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const insights = JSON.parse(jsonString);
      
      return {
        aiSummary: insights.aiSummary,
        relationshipHealthScore: insights.relationshipHealthScore,
        interestPercentage: insights.interestPercentage,
        cookedStatus: insights.cookedStatus
      };
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      return getDefaultAIInsights(stats);
    }
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return getDefaultAIInsights(stats);
  }
}

// Fallback function for default AI insights when API call fails
function getDefaultAIInsights(stats: ChatStats): {
  aiSummary: string;
  relationshipHealthScore: {
    overall: number;
    details: {
      balance: number;
      engagement: number;
      positivity: number;
      consistency: number;
    };
    redFlags?: string[];
  };
  interestPercentage: Record<string, {
    score: number;
    details: {
      initiation: number;
      responseRate: number;
      enthusiasm: number;
      consistency: number;
    };
  }>;
  cookedStatus: {
    isCooked: boolean;
    user: string;
    confidence: number;
  };
} {
  // Get users from the stats
  const users = Object.keys(stats.messagesByUser || {});
  
  // Create default insights
  const defaultInsights = {
    aiSummary: "AI chat summary could not be generated. Please try again later.",
    relationshipHealthScore: {
      overall: 50,
      details: {
        balance: 50,
        engagement: 50,
        positivity: 50,
        consistency: 50
      },
      redFlags: []
    },
    interestPercentage: {} as Record<string, {
      score: number;
      details: {
        initiation: number;
        responseRate: number;
        enthusiasm: number;
        consistency: number;
      };
    }>,
    cookedStatus: {
      isCooked: false,
      user: users.length > 0 ? users[0] : "Unknown",
      confidence: 0
    }
  };
  
  // Add interest percentage for each user
  users.forEach(user => {
    defaultInsights.interestPercentage[user] = {
      score: 50,
      details: {
        initiation: 50,
        responseRate: 50,
        enthusiasm: 50,
        consistency: 50
      }
    };
  });
  
  return defaultInsights;
}