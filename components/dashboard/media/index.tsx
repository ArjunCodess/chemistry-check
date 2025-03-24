import { ChatStats } from "@/types";
import { MediaOverview } from "./media-overview";
import { MediaByUser } from "./media-by-user";

interface MediaProps {
  stats: ChatStats;
}

export function Media({ stats }: MediaProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MediaOverview stats={stats} />
        <MediaByUser stats={stats} />
      </div>
    </div>
  );
}