import { ChatStats } from "@/types";

interface MessagesCountCardProps {
  stats: ChatStats;
}

export function MessagesCountCard({ stats }: MessagesCountCardProps) {
  const users = Object.keys(stats.messagesByUser || {});
  const messageCounts = users.map(user => ({
    user,
    count: stats.messagesByUser?.[user] || 0
  }));
  
  messageCounts.sort((a, b) => b.count - a.count);
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-blue-800 dark:text-blue-200 mb-4">
        Messages count
      </h3>
      
      <div className="flex justify-between">
        {messageCounts.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">{messageCounts[0]?.user}</p>
            <p className="text-4xl font-bold text-blue-800 dark:text-blue-100">
              {messageCounts[0]?.count.toLocaleString()}
            </p>
          </div>
        )}
        
        {messageCounts.length > 1 && (
          <div className="text-center">
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">{messageCounts[1]?.user}</p>
            <p className="text-4xl font-bold text-blue-800 dark:text-blue-100">
              {messageCounts[1]?.count.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 