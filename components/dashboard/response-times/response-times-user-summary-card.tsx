import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponseTimeStats } from "@/types";
import {
  calculateResponsePercentage,
  getTotalResponses,
} from "@/lib/response-time-utils";

interface ResponseTimesUserSummaryCardProps {
  user: string;
  rtStats: ResponseTimeStats;
}

export function ResponseTimesUserSummaryCard({
  user,
  rtStats,
}: ResponseTimesUserSummaryCardProps) {
  const distribution = rtStats?.distribution ?? {};
  const totalResponses = getTotalResponses(distribution);

  // Calculate quick response percentage
  const quickResponsePercentage = calculateResponsePercentage(
    distribution,
    "0-5min"
  );

  // Calculate ghosting percentage
  const ghostingPercentage = calculateResponsePercentage(distribution, "1hour+");

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{user}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold">
              {rtStats && typeof rtStats.average === "number"
                ? `${rtStats.average.toFixed(1)}`
                : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              avg. minutes to respond
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">
              {quickResponsePercentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              quick responses
            </div>
          </div>
        </div>

        <div className="mt-4 flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Quick responses (0-5min) */}
          <div
            className="bg-primary h-full"
            style={{
              width: `${
                totalResponses > 0
                  ? ((distribution["0-5min"] || 0) / totalResponses) * 100
                  : 0
              }%`,
            }}
          ></div>
          {/* Normal responses (5-15min) */}
          <div
            className="bg-blue-400 h-full"
            style={{
              width: `${
                totalResponses > 0
                  ? ((distribution["5-15min"] || 0) / totalResponses) * 100
                  : 0
              }%`,
            }}
          ></div>
          {/* Slow responses (15-30min) */}
          <div
            className="bg-amber-400 h-full"
            style={{
              width: `${
                totalResponses > 0
                  ? ((distribution["15-30min"] || 0) / totalResponses) * 100
                  : 0
              }%`,
            }}
          ></div>
          {/* Very slow responses (30min-1hour) */}
          <div
            className="bg-orange-400 h-full"
            style={{
              width: `${
                totalResponses > 0
                  ? ((distribution["30min-1hour"] || 0) / totalResponses) * 100
                  : 0
              }%`,
            }}
          ></div>
          {/* Ghosting (1hour+) */}
          <div
            className="bg-red-400 h-full"
            style={{
              width: `${
                totalResponses > 0
                  ? ((distribution["1hour+"] || 0) / totalResponses) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Quick</span>
          <span>Ghosting: {ghostingPercentage}%</span>
        </div>
      </CardContent>
    </Card>
  );
} 