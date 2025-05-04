import { ChatStats } from "@/types";

interface ApologyCardProps {
  stats: ChatStats;
}

export function ApologyCard({ stats }: ApologyCardProps) {
  const sorryByUser = stats.sorryByUser || {};
  const users = Object.keys(sorryByUser);

  if (users.length === 0) return null;

  const totalApologies = Object.values(sorryByUser).reduce(
    (sum, count) => sum + (count as number),
    0
  );

  const mostApologeticUser = users.reduce(
    (max, user) =>
      (sorryByUser[user] as number) > ((sorryByUser[max] as number) || 0)
        ? user
        : max,
    users[0]
  );

  const apologyPercentage = Math.round(
    ((sorryByUser[mostApologeticUser] as number) / totalApologies) * 100
  );

  return (
    <div className="bg-rose-50 dark:bg-rose-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-rose-800 dark:text-rose-200 mb-4">
        Apology Analysis
      </h3>
      <div className="flex justify-between items-center">
        <span className="text-rose-700 dark:text-rose-300">
          Most Apologetic
        </span>
        <div className="text-right">
          <span className="text-rose-600 dark:text-rose-400 font-medium">
            {mostApologeticUser}
          </span>
          <span className="text-rose-500 dark:text-rose-400 text-sm ml-2">
            ({apologyPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
}