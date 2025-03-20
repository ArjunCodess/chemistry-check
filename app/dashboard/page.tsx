'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface ChatStats {
  totalMessages: number;
  messagesByUser: Record<string, number>;
  totalWords: number;
  wordsByUser: Record<string, number>;
  mostUsedWords: Array<{ word: string; count: number }>;
  mostUsedEmojis: Array<{ emoji: string; count: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('chatStats');
      if (!savedStats) {
        toast.error('No chat data found', {
          description: 'Please upload a chat file first',
          duration: 4000,
          className: 'bg-white text-black',
          descriptionClassName: 'text-black',
        });
        router.push('/');
        return;
      }
      setStats(JSON.parse(savedStats));
    } catch (error) {
      console.error('Error loading chat stats:', error);
      toast.error('Failed to load chat data', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 4000,
        className: 'bg-white text-black',
        descriptionClassName: 'text-black',
      });
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chat Analytics</h1>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
        >
          Upload New Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Messages: {stats.totalMessages}</p>
              <p>Total Words: {stats.totalWords}</p>
            </div>
          </CardContent>
        </Card>

        {/* Messages by User */}
        <Card>
          <CardHeader>
            <CardTitle>Messages by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.messagesByUser).map(([user, count]) => (
                <p key={user}>{user}: {count} messages</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Words by User */}
        <Card>
          <CardHeader>
            <CardTitle>Words by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.wordsByUser).map(([user, count]) => (
                <p key={user}>{user}: {count} words</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Used Words */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.mostUsedWords.map(({ word, count }) => (
                <p key={word}>{word}: {count} times</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Used Emojis */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Emojis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.mostUsedEmojis.map(({ emoji, count }) => (
                <p key={emoji}>{emoji}: {count} times</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 