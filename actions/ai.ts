import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatStats, RelationshipHealthScore, InterestPercentage, CookedStatus, AttachmentStyle } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
};

export async function generateAIInsights(stats: ChatStats, sampleMessages: Array<{ from: string; text: string; date: string }>) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return getDefaultAIInsights(stats);
    }

    const chatSummary = {
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
    
    const prompt = `
      You are an expert in analyzing chat conversations. Based on the provided chat statistics and sample messages, please generate:
      
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
      
      6. Analyze each participant's attachment style based on their messaging behavior:
         - Secure: Shows consistent communication, healthy boundaries, direct expression of needs
         - Anxious: Shows fear of abandonment, excessive messaging, seeks constant reassurance
         - Avoidant: Shows emotional distance, delayed responses, avoids deep conversation
         - Disorganized: Shows unpredictable patterns, mixed signals, hot/cold behavior
         
         For each person, provide:
         - Primary attachment style
         - Secondary attachment style (if applicable)
         - Percentage breakdown of each style
         - Short description explaining their attachment patterns
         - Confidence level of this assessment (0-100)
      
      Chat Statistics:
      ${JSON.stringify(chatSummary, null, 2)}
      
      Sample Messages:
      ${JSON.stringify(sampleMessages, null, 2)}
      
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
        },
        "attachmentStyles": {
          "User1": {
            "user": "User1",
            "primaryStyle": "Anxious",
            "secondaryStyle": "Secure",
            "confidence": 85,
            "details": {
              "secure": 35,
              "anxious": 60,
              "avoidant": 10,
              "disorganized": 5
            },
            "description": "Shows signs of anxious attachment with frequent messaging and seeking reassurance, but also has secure tendencies in expressing needs directly."
          },
          "User2": {
            "user": "User2",
            "primaryStyle": "Avoidant",
            "confidence": 75,
            "details": {
              "secure": 20,
              "anxious": 5,
              "avoidant": 70,
              "disorganized": 5
            },
            "description": "Displays classic avoidant behavior with delayed responses and emotional distance."
          }
        }
      }
    `;
    
    const chatSession = model.startChat({
      generationConfig,
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    const insights = JSON.parse(jsonString);
    
    return {
      aiSummary: insights.aiSummary,
      relationshipHealthScore: insights.relationshipHealthScore,
      interestPercentage: insights.interestPercentage,
      cookedStatus: insights.cookedStatus,
      attachmentStyles: insights.attachmentStyles
    };
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return getDefaultAIInsights(stats);
  }
}

function getDefaultAIInsights(stats: ChatStats): {
  aiSummary: string;
  relationshipHealthScore: RelationshipHealthScore;
  interestPercentage: Record<string, InterestPercentage>;
  cookedStatus: CookedStatus;
  attachmentStyles: Record<string, AttachmentStyle>;
} {
  const users = Object.keys(stats.messagesByUser || {});
  
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
    interestPercentage: {} as Record<string, InterestPercentage>,
    cookedStatus: {
      isCooked: false,
      user: users.length > 0 ? users[0] : "Unknown",
      confidence: 0
    },
    attachmentStyles: {} as Record<string, AttachmentStyle>
  };
  
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
    
    defaultInsights.attachmentStyles[user] = {
      user: user,
      primaryStyle: "Unknown",
      confidence: 0,
      details: {
        secure: 25,
        anxious: 25,
        avoidant: 25,
        disorganized: 25
      },
      description: "Attachment style analysis could not be generated."
    };
  });
  
  return defaultInsights;
}