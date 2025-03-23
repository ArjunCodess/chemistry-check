import { ResponseTimesOverviewCard } from "./response-times-overview-card";
import { ResponseTimesUserSummaryCard } from "./response-times-user-summary-card";
import { ResponseTimesUserDetailCard } from "./response-times-user-detail-card";
import { ChatStats } from "@/types";

interface ResponseTimesProps {
  stats: ChatStats;
}

export function ResponseTimes({ stats }: ResponseTimesProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResponseTimesOverviewCard />

        {/* User summary cards */}
        {Object.entries(stats?.responseTimes ?? {}).map(([user, rtStats]) => (
          <ResponseTimesUserSummaryCard
            key={`summary-${user}`}
            user={user}
            rtStats={rtStats}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(stats?.responseTimes ?? {}).map(([user, rtStats]) => (
          <ResponseTimesUserDetailCard
            key={`detail-${user}`}
            user={user}
            rtStats={rtStats}
          />
        ))}
      </div>
    </div>
  );
}

export { ResponseTimesOverviewCard } from "./response-times-overview-card";
export { ResponseTimesUserSummaryCard } from "./response-times-user-summary-card";
export { ResponseTimesUserDetailCard } from "./response-times-user-detail-card";
export { ResponseTimeCategory } from "./response-time-category"; 