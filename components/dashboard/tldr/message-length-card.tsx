import { ChatStats } from "@/types";

interface MessageLengthCardProps {
  stats: ChatStats;
}

export function MessageLengthCard({ stats }: MessageLengthCardProps) {
  const longestMessages = stats.longestMessages || {};
  const users = Object.keys(longestMessages);

  if (users.length === 0) return null;

  const messageLengthStats: Record<
    string,
    {
      longest: number;
      shortest: number;
      average: number;
    }
  > = {};

  for (const user of users) {
    const userMessages = longestMessages[user] || [];

    if (userMessages.length === 0) continue;

    const longest = userMessages[0]?.length || 0;
    const shortest = userMessages[userMessages.length - 1]?.length || longest;

    const total = userMessages.reduce((sum, msg) => sum + msg.length, 0);
    const average = userMessages.length > 0 ? total / userMessages.length : 0;

    messageLengthStats[user] = {
      longest,
      shortest,
      average,
    };
  }

  const longestMessageUser = Object.keys(messageLengthStats).reduce(
    (max, user) =>
      messageLengthStats[user].longest > (messageLengthStats[max]?.longest || 0)
        ? user
        : max,
    Object.keys(messageLengthStats)[0] || ""
  );

  if (!longestMessageUser) return null;

  return (
    <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-cyan-800 dark:text-cyan-200 mb-4">
        Message Length Analysis
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-cyan-700 dark:text-cyan-300">
            Longest Message
          </span>
          <div className="text-right">
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">
              {longestMessageUser}
            </span>
            <span className="text-cyan-500 dark:text-cyan-400 text-sm ml-2">
              ({messageLengthStats[longestMessageUser].longest} words)
            </span>
          </div>
        </div>

        {Object.keys(messageLengthStats).map((user) => (
          <div className="flex justify-between items-center" key={user}>
            <span className="text-cyan-700 dark:text-cyan-300">{user}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">
              avg. {Math.round(messageLengthStats[user].average)} words
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}