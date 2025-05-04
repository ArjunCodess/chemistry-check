import { ChatStats } from "@/types";

interface ResponseTimeCardProps {
  stats: ChatStats;
}

export function ResponseTimeCard({ stats }: ResponseTimeCardProps) {
  const users = Object.keys(stats.messagesByUser || {}).filter(
    user => stats.responseTimes?.[user] !== undefined
  );
  
  const formatResponseTime = (minutes: number) => {
    if (minutes < 1) {
      return Math.round(minutes * 60) + "s";
    } else if (minutes < 60) {
      return Math.round(minutes) + "m";
    } else {
      return Math.round(minutes / 60) + " hours";
    }
  };
  
  const responseTimes = users.map(user => ({
    user,
    avgTime: stats.responseTimes?.[user]?.average || 0
  }));
  
  responseTimes.sort((a, b) => a.avgTime - b.avgTime);
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-amber-800 dark:text-amber-200 mb-4">
        Average response time
      </h3>
      
      <div className="flex justify-between">
        {responseTimes.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-amber-600 dark:text-amber-300 mb-1">{responseTimes[0]?.user}</p>
            <p className="text-4xl font-bold text-amber-800 dark:text-amber-100">
              {formatResponseTime(responseTimes[0]?.avgTime || 0)}
            </p>
          </div>
        )}
        
        {responseTimes.length > 1 && (
          <div className="text-center">
            <p className="text-sm text-amber-600 dark:text-amber-300 mb-1">{responseTimes[1]?.user}</p>
            <p className="text-4xl font-bold text-amber-800 dark:text-amber-100">
              {formatResponseTime(responseTimes[1]?.avgTime || 0)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 