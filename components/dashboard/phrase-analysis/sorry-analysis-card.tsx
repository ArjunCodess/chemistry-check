import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface SorryAnalysisCardProps {
  stats: ChatStats;
}

export function SorryAnalysisCard({ stats }: SorryAnalysisCardProps) {
  return (
    <div className="mb-6">
      <Card className="w-full flex md:flex-row justify-between">
        <CardHeader className="md:w-1/2">
          <CardTitle className="text-lg">
            Who Says
            <br className="hidden md:block" /> Sorry More?
          </CardTitle>
        </CardHeader>
        <CardContent className="md:text-right">
          {stats?.sorryByUser && Object.keys(stats.sorryByUser).length > 0 ? (
            (() => {
              const sortedUsers = Object.entries(stats.sorryByUser).sort(
                ([, a], [, b]) => (b as number) - (a as number)
              );

              if (sortedUsers.length === 0)
                return <p>No apologies found in chat.</p>;

              const [topUser, topCount] = sortedUsers[0];
              const totalSorries = Object.values(stats.sorryByUser).reduce(
                (sum, count) => sum + (count as number),
                0
              );
              const percentage = Math.round(
                ((topCount as number) / totalSorries) * 100
              );

              return (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-lg">{topUser}</span>
                    <p className="text-sm text-muted-foreground">
                      Said sorry {topCount} times ({percentage}% of all
                      apologies)
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}