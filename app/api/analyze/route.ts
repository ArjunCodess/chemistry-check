import { parseChatData as parseTelegramChatData } from '@/lib/chat-parser/telegram';
import { parseChatData as parseInstagramChatData } from '@/lib/chat-parser/instagram';
import { parseChatData as parseWhatsappChatData } from '@/lib/chat-parser/whatsapp';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatAnalysis, user, session as sessionTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log("Starting analyze API request");
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;
    const name = formData.get('name') as string || 'Untitled Analysis';

    console.log(`Received request: platform=${platform}, name=${name}, file size=${file?.size || 'N/A'}`);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: 'No platform specified' },
        { status: 400 }
      );
    }

    let userId;

    try {
      // Get current user session
      console.log("Attempting to get user session");

      // First try from auth.api.getSession
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        userId = session.user.id;
        console.log(`User authenticated from session: ${userId}`);
      } else {
        // If no session, check for Authorization header
        const authHeader = request.headers.get('Authorization');
        console.log(`Authorization header: ${authHeader ? 'Present' : 'Not present'}`);
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          // Find session by token
          const [sessionRecord] = await db
            .select()
            .from(sessionTable)
            .where(eq(sessionTable.token, token))
            .limit(1);
          
          if (sessionRecord && sessionRecord.userId) {
            userId = sessionRecord.userId;
            console.log(`User authenticated from token: ${userId}`);
          }
        }
      }

      if (!userId) {
        console.log("No user ID found in session or Authorization header");
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify that the user exists in the database
      console.log("Verifying user in database");
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord) {
        console.log("User record not found in database");
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log("User verified in database");
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: String(authError) },
        { status: 401 }
      );
    }

    try {
      console.log("Reading file text");
      const text = await file.text();
      console.log(`File text read: ${text.length} characters`);

      let stats;
      let participantCount = 0;

      try {
        // Parse the chat data based on the platform
        if (platform === 'telegram') {
          console.log("Processing Telegram chat...");
          // For Telegram data, we expect a JSON file
          const jsonData = JSON.parse(text);
          stats = await parseTelegramChatData(jsonData);

          // Count unique participants
          participantCount = Object.keys(stats.messagesByUser).length;
        } else if (platform === 'whatsapp') {
          console.log("Processing WhatsApp chat...");
          // For WhatsApp data, we expect a text file
          stats = await parseWhatsappChatData(text);

          // Count unique participants
          participantCount = Object.keys(stats.messagesByUser).length;
        } else if (platform === 'instagram') {
          console.log("Processing Instagram chat...");
          // For Instagram data, we expect a JSON file
          const jsonData = JSON.parse(text);
          stats = await parseInstagramChatData(jsonData);

          // Count unique participants
          participantCount = Object.keys(stats.messagesByUser).length;
        } else {
          return NextResponse.json(
            { error: 'Unsupported platform' },
            { status: 400 }
          );
        }

        console.log("Chat data processed successfully");

        try {
          console.log("Saving analysis to database");
          // Save the analysis to the database
          const [savedAnalysis] = await db.insert(chatAnalysis).values({
            userId,
            platform,
            name,
            stats,
            totalMessages: stats.totalMessages || 0,
            totalWords: stats.totalWords || 0,
            participantCount,
          }).returning({ id: chatAnalysis.id });

          console.log(`Analysis saved with ID: ${savedAnalysis.id}`);

          // Add the ID to the response
          return NextResponse.json({
            ...stats,
            analysisId: savedAnalysis.id
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
          return NextResponse.json(
            { error: 'Failed to save analysis to database', details: String(dbError) },
            { status: 500 }
          );
        }
      } catch (processingError) {
        console.error("Error processing chat data:", processingError);
        return NextResponse.json(
          { error: 'Failed to process chat data', details: String(processingError) },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { error: 'Failed to process file', details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: String(error) },
      { status: 500 }
    );
  }
}