import { ChatStats } from "@/types";
import { formatFileSize } from "@/lib/format-utils";

interface MediaAnalysisCardProps {
  stats: ChatStats;
}

export function MediaAnalysisCard({ stats }: MediaAnalysisCardProps) {
  const mediaStats = stats.mediaStats;
  
  // Find user who sent more media
  let topMediaUser = { user: "", count: 0 };
  
  if (mediaStats && mediaStats.byUser) {
    for (const [user, data] of Object.entries(mediaStats.byUser)) {
      if (data.total > topMediaUser.count) {
        topMediaUser = { user, count: data.total };
      }
    }
  }

  // Check if media types exist and have values greater than zero
  const hasMediaTypes = mediaStats && mediaStats.byType && 
    Object.entries(mediaStats.byType).some(([, count]) => count > 0);

  if (!hasMediaTypes) {
    return null;
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-emerald-800 dark:text-emerald-200 mb-4">
        Media Analysis
      </h3>
      
      <div className="space-y-4">
        {/* Total Media Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Files</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {mediaStats?.total || 0}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Size</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatFileSize(mediaStats?.totalSize || 0)}
            </p>
          </div>
        </div>
        
        {/* Media Types */}
        {hasMediaTypes && (
          <div className="space-y-2">
            {Object.entries(mediaStats.byType)
              .filter(([, count]) => count > 0)
              .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
              .slice(0, 3)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-emerald-700 dark:text-emerald-300 capitalize">{type}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{count}</span>
                </div>
              ))
            }
          </div>
        )}
        
        {/* Top Media User */}
        {topMediaUser.user && (
          <div className="text-center pt-2">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Most Media Shared By</p>
            <p className="text-xl font-medium text-emerald-700 dark:text-emerald-300 mt-1">
              {topMediaUser.user}
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {topMediaUser.count} files
              {mediaStats?.total ? ` (${Math.round((topMediaUser.count / mediaStats.total) * 100)}%)` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 