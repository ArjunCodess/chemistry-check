import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface ResponseStatsCardProps {
  stats: ChatStats;
}

export function ResponseStatsCard({ stats }: ResponseStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(stats.responseTimes || {}).map(
            ([user, rtStats]) => (
              <div key={user} className="flex justify-between items-center">
                <span className="text-sm font-medium">{user}:</span>
                <span className="font-semibold">
                  {rtStats && typeof rtStats.average === "number"
                    ? `${rtStats.average.toFixed(1)} min`
                    : "N/A"}
                </span>
              </div>
            )
          )}
          {Object.keys(stats.responseTimes || {}).length === 0 && (
            <div className="text-sm text-gray-500">
              No response time data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 