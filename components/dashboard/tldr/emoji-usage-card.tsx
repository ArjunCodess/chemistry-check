import { ChatStats } from "@/types";

interface EmojiUsageCardProps {
  stats: ChatStats;
}

export function EmojiUsageCard({ stats }: EmojiUsageCardProps) {
  const emojiStats = stats.emojiStats || {
    frequency: {},
    byUser: {},
    combinations: [],
    sentiment: { positive: 0, negative: 0, neutral: 0 }
  };
  
  // Check if we have emoji usage data
  if (!emojiStats.byUser || Object.keys(emojiStats.byUser).length === 0) {
    return null;
  }
  
  const users = Object.keys(emojiStats.byUser);
  
  // Calculate total emoji count
  const totalEmojis = Object.values(emojiStats.byUser).reduce(
    (sum, userStats) => sum + Object.values(userStats).reduce((total, count) => total + (count as number), 0), 
    0
  );
  
  // Find which user uses the most emojis
  let mostEmojiUser = "";
  let maxEmojiCount = 0;
  
  for (const user of users) {
    const userEmojis = emojiStats.byUser[user];
    const userTotal = Object.values(userEmojis).reduce((sum, count) => sum + (count as number), 0);
    
    if (userTotal > maxEmojiCount) {
      mostEmojiUser = user;
      maxEmojiCount = userTotal;
    }
  }
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-amber-800 dark:text-amber-200 mb-4">
        Emoji Usage
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-amber-700 dark:text-amber-300">Total Emojis</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {totalEmojis}
          </span>
        </div>
        
        {mostEmojiUser && (
          <div className="flex justify-between items-center">
            <span className="text-amber-700 dark:text-amber-300">Most Used By</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {mostEmojiUser}
            </span>
          </div>
        )}
        
        {users.map(user => {
          const userEmojis = emojiStats.byUser[user];
          const userTotal = Object.values(userEmojis).reduce((sum, count) => sum + (count as number), 0);
          const percentage = totalEmojis > 0 ? Math.round((userTotal / totalEmojis) * 100) : 0;
          
          // Get top 5 emojis for this user
          const topEmojis = Object.entries(userEmojis)
            .map(([emoji, count]) => ({ emoji, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(item => item.emoji);
          
          return (
            <div key={user} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-amber-700 dark:text-amber-300">{user}</span>
                <div className="text-right">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {userTotal}
                  </span>
                  <span className="text-amber-500 dark:text-amber-400 text-sm ml-2">
                    ({percentage}%)
                  </span>
                </div>
              </div>
              
              {topEmojis.length > 0 && (
                <div className="text-amber-600 dark:text-amber-400 text-sm">
                  Favorites: {topEmojis.join(" ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 