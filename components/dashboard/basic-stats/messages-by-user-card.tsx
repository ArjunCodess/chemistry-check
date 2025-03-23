import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface MessagesByUserCardProps {
  stats: ChatStats;
}

export function MessagesByUserCard({ stats }: MessagesByUserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages by User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(stats.messagesByUser).map(([user, count]) => (
            <div key={user} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{user}:</span>
                <span className="font-semibold">{count} messages</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{
                    width: `${(count / stats.totalMessages) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 