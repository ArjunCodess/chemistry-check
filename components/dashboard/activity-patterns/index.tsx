import { Suspense } from "react";
import { ChatStats } from "@/types";
import { MessagesByHourCard } from "./messages-by-hour-card";
import { MessagesByDayCard } from "./messages-by-day-card";
import { MessagesByMonthCard } from "./messages-by-month-card";

interface ActivityPatternsProps {
  stats: ChatStats;
}

export function ActivityPatterns({ stats }: ActivityPatternsProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6">
        <MessagesByHourCard stats={stats} />
        <MessagesByDayCard stats={stats} />
        <MessagesByMonthCard stats={stats} />
      </div>
    </Suspense>
  );
} 