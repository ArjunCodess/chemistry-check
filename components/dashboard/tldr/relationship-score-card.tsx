import { ChatStats } from "@/types";

interface RelationshipScoreCardProps {
  stats: ChatStats;
}

export function RelationshipScoreCard({ stats }: RelationshipScoreCardProps) {
  const score = stats.relationshipHealthScore;
  
  if (!score) return null;
  
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-emerald-800 dark:text-emerald-200 mb-4">
        Relationship Health
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-emerald-700 dark:text-emerald-300">Overall Score</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {score.overall}/100
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-emerald-700 dark:text-emerald-300">Balance</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {score.details.balance}/100
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-emerald-700 dark:text-emerald-300">Engagement</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {score.details.engagement}/100
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-emerald-700 dark:text-emerald-300">Positivity</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {score.details.positivity}/100
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-emerald-700 dark:text-emerald-300">Consistency</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {score.details.consistency}/100
          </span>
        </div>
      </div>
    </div>
  );
} 