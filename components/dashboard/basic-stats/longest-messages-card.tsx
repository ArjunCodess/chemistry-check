import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatStats } from "@/types";

interface LongestMessagesCardProps {
  stats: ChatStats;
  expandedMessages?: Record<string, Record<number, boolean>>;
  toggleMessageExpand?: (user: string, index: number) => void;
}

export function LongestMessagesCard({ 
  stats, 
  expandedMessages = {}, 
  toggleMessageExpand = () => {} 
}: LongestMessagesCardProps) {
  // Ensure longestMessages exists and is not null/undefined
  const longestMessages = stats?.longestMessages || {};
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 3 Longest Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(longestMessages).map(
            ([user, messages]) => {
              // Skip if messages is null or undefined
              if (!messages) return null;
              
              return (
                <div key={user} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium mb-3">{user}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Array.isArray(messages)
                      ? messages
                      : [messages]
                    ).map((message, index) => {
                      // Skip if message is null or undefined
                      if (!message) return null;
                      
                      // Ensure message.text is a string
                      const messageText =
                        typeof message.text === "string"
                          ? message.text
                          : String(message.text || "");

                      // Get expansion state with fallback
                      // Make sure expandedMessages exists and has the user property
                      const isExpanded = Boolean(
                        expandedMessages && 
                        expandedMessages[user] && 
                        expandedMessages[user][index]
                      );

                      // Only truncate if longer than 100 chars and not expanded
                      const shouldTruncate =
                        messageText.length > 100 && !isExpanded;
                      const displayText = shouldTruncate
                        ? messageText.substring(0, 100) + "..."
                        : messageText;

                      return (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              {message.date || "Unknown date"}
                            </span>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {message.length} words
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            &ldquo;{displayText}&rdquo;
                          </p>
                          {messageText.length > 100 && toggleMessageExpand && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 h-auto p-0"
                              onClick={() => toggleMessageExpand(user, index)}
                            >
                              {isExpanded ? "Show Less" : "Read More"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
          {Object.keys(longestMessages).length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No message data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 