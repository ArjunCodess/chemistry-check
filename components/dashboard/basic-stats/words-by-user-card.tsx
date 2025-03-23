import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface WordsByUserCardProps {
  stats: ChatStats;
}

export function WordsByUserCard({ stats }: WordsByUserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Words by User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(stats.wordsByUser).map(([user, count]) => (
            <div key={user} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{user}:</span>
                <span className="font-semibold">{count} words</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{
                    width: `${(count / stats.totalWords) * 100}%`,
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