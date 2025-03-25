import { parseChatData as parseTelegramChatData } from '@/lib/chat-parser/telegram';
// import { parseChatData as parseInstagramChatData } from '@/lib/chat-parser/instagram';
import { parseChatData as parseWhatsappChatData } from '@/lib/chat-parser/whatsapp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;

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

    const text = await file.text();

    let stats;
    switch (platform) {
      case 'telegram':
        const chatData = JSON.parse(text);
        stats = await parseTelegramChatData(chatData);
        break;
      // case 'instagram':
      //   stats = await parseInstagramChatData(chatData);
      //   break;
      case 'whatsapp':
        stats = await parseWhatsappChatData(text);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid platform specified' },
          { status: 400 }
        );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}