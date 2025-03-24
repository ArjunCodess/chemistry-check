import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatStats } from "@/types";

interface ChatSummaryCardProps {
  stats: ChatStats;
  onUploadNewChat: () => void;
}

export function ChatSummaryCard({ stats, onUploadNewChat }: ChatSummaryCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>AI-Generated Chat Summary</CardTitle>
        <CardDescription>
          A TL;DR of what your chat is really about, including key patterns and dynamics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.aiSummary ? (
          <div>
            {/* Cooked Status Alert */}
            {stats.cookedStatus?.isCooked && (
              <div className="mb-6 p-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-md shadow-lg">
                <h2
                  className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-md"
                  style={{ animation: "cookedTextPulse 2s infinite" }}
                >
                  {stats.cookedStatus.user} IS COOKED!
                </h2>
                <p className="text-sm text-center text-white mt-2 font-medium">
                  Confidence: {stats.cookedStatus.confidence}%
                </p>
                <style jsx>{`
                  @keyframes cookedTextPulse {
                    0%, 100% {
                      transform: scale(1);
                    }
                    50% {
                      transform: scale(1.05);
                    }
                  }
                `}</style>
              </div>
            )}
            <div className="p-4 bg-slate-50 rounded-lg antialiased">
              <p className="whitespace-pre-line text-xs md:text-sm">
                {stats.aiSummary}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 bg-slate-100 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M12 2a7.5 7.5 0 0 0-5.3 12.9L12 21l5.3-6.1A7.5 7.5 0 0 0 12 2Z" />
                <path d="M12 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              AI Summary Not Available
            </h3>
            <p className="text-slate-500 text-sm max-w-md">
              Upload your chat history to generate an AI-powered summary of your conversation dynamics.
            </p>
            <Button className="mt-4" onClick={onUploadNewChat}>
              Upload Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 