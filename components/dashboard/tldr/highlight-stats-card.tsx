import { ChatStats } from "@/types";

interface HighlightStatsCardProps {
  stats: ChatStats;
}

export function HighlightStatsCard({ stats }: HighlightStatsCardProps) {
  // Find who sent more messages
  const messagesByUser = stats.messagesByUser || {};
  let dominantMessager = { user: "", count: 0 };
  
  for (const [user, count] of Object.entries(messagesByUser)) {
    if (count > dominantMessager.count) {
      dominantMessager = { user, count: count as number };
    }
  }
  
  const dominantPercentage = dominantMessager.count > 0
    ? Math.round((dominantMessager.count / stats.totalMessages) * 100)
    : 0;
  
  return (
    <div className="bg-violet-50 dark:bg-violet-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-violet-800 dark:text-violet-200 mb-4">
        Key Highlights
      </h3>
      
      <div className="space-y-4">
        {/* Total Messages */}
        <div className="flex justify-between items-center">
          <span className="text-violet-700 dark:text-violet-300">Total Messages</span>
          <span className="text-violet-600 dark:text-violet-400 font-medium">
            {stats.totalMessages.toLocaleString()}
          </span>
        </div>
        
        {/* Dominant Messager */}
        <div className="flex justify-between items-center">
          <span className="text-violet-700 dark:text-violet-300">Most Active</span>
          <div className="text-right">
            <span className="text-violet-600 dark:text-violet-400 font-medium">
              {dominantMessager.user}
            </span>
            <span className="text-violet-500 dark:text-violet-400 text-sm ml-2">
              ({dominantPercentage}%)
            </span>
          </div>
        </div>
        
        {/* Relationship Health */}
        {stats.relationshipHealthScore && (
          <div className="flex justify-between items-center">
            <span className="text-violet-700 dark:text-violet-300">
              Relationship Health
            </span>
            <span className="text-violet-600 dark:text-violet-400 font-medium">
              {stats.relationshipHealthScore.overall}/100
            </span>
          </div>
        )}
        
        {/* Match Score */}
        {stats.matchPercentage && (
          <div className="flex justify-between items-center">
            <span className="text-violet-700 dark:text-violet-300">
              Match Score
            </span>
            <span className="text-violet-600 dark:text-violet-400 font-medium">
              {stats.matchPercentage.score}/100
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 