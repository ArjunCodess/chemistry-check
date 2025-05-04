import { ChatStats } from "@/types";

interface PersonalityInsightsCardProps {
  stats: ChatStats;
}

export function PersonalityInsightsCard({ stats }: PersonalityInsightsCardProps) {
  const attachmentStyles = stats.attachmentStyles || {};
  const users = Object.keys(attachmentStyles);
  
  const attachmentDescriptions = {
    secure: "Comfortable with intimacy and independence.",
    anxious: "Seeks high levels of closeness and fears rejection.",
    avoidant: "Values independence and may limit emotional intimacy.",
    disorganized: "Desires closeness but fears it at the same time."
  };

  const attachmentEmojis = {
    secure: "🌟",
    anxious: "🔍",
    avoidant: "🛡️",
    disorganized: "🌪️"
  };
  
  const interestPercentages = stats.interestPercentage || {};
  
  if (users.length === 0 && Object.keys(interestPercentages).length === 0) {
    return null;
  }
  
  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-indigo-800 dark:text-indigo-200 mb-4">
        Personality Insights
      </h3>
      
      <div className="space-y-6">
        {users.length > 0 && (
          <div className="space-y-4">
            {users.map(user => {
              const style = attachmentStyles[user];
              if (!style) return null;
              
              return (
                <div key={user} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm text-indigo-700 dark:text-indigo-300">{user}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">
                        {attachmentEmojis[style.primaryStyle as keyof typeof attachmentEmojis]}
                      </span>
                      <span className="font-medium text-indigo-700 dark:text-indigo-300 capitalize">
                        {style.primaryStyle}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {attachmentDescriptions[style.primaryStyle as keyof typeof attachmentDescriptions]}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        {Object.keys(interestPercentages).length > 0 && (
          <div className="space-y-4">
            {Object.entries(interestPercentages).map(([user, data]) => (
              <div key={user} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm text-indigo-700 dark:text-indigo-300">{user}</h3>
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">{data.score}%</span>
                </div>
                <div className="w-full bg-indigo-100 dark:bg-indigo-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 dark:bg-indigo-400" 
                    style={{ width: `${data.score}%` }}
                  />
                </div>
              </div>
            ))}
            
            {Object.keys(interestPercentages).length >= 2 && (
              <div className="text-center text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                {(() => {
                  const scores = Object.values(interestPercentages).map(data => data.score);
                  const difference = Math.abs(scores[0] - scores[1]);
                  
                  if (difference > 25) {
                    return "⚠️ Significant interest imbalance";
                  } else if (difference > 15) {
                    return "⚡ Moderate interest imbalance";
                  } else {
                    return "✨ Balanced interest levels";
                  }
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 