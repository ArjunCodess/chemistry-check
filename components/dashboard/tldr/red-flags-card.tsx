import { ChatStats } from "@/types";

interface RedFlagsCardProps {
  stats: ChatStats;
}

export function RedFlagsCard({ stats }: RedFlagsCardProps) {
  const redFlags = stats.relationshipHealthScore?.redFlags || [];
  
  if (redFlags.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 rounded-3xl p-5 shadow-sm h-auto">
        <h3 className="text-lg font-medium text-center text-red-800 dark:text-red-200 mb-4">
          Red flags
        </h3>
        <div className="text-center text-red-600 dark:text-red-300 py-4">
          <p className="text-lg">✓ No red flags detected</p>
          <p className="text-sm mt-2">Healthy communication patterns observed</p>
        </div>
      </div>
    );
  }
  
  const flagEmojis = ["🚩", "⚠️", "❗", "⛔", "🔥"];
  
  return (
    <div className="bg-red-50 dark:bg-red-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-red-800 dark:text-red-200 mb-4">
        Red Flags
      </h3>
      
      <div className="space-y-3 max-h-[280px] overflow-hidden">
        {redFlags.slice(0, 3).map((flag, index) => (
          <div key={index} className="flex items-start gap-3 text-red-700 dark:text-red-300">
            <div className="flex-shrink-0 text-xl mt-0.5">
              {flagEmojis[index % flagEmojis.length]}
            </div>
            <div>
              <p>{flag}</p>
            </div>
          </div>
        ))}
        {redFlags.length > 3 && (
          <p className="text-center text-red-600 dark:text-red-400 text-sm mt-1">
            +{redFlags.length - 3} more red flags
          </p>
        )}
      </div>
    </div>
  );
} 