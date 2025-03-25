import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { CircleCheckBig } from "lucide-react";

interface SorryAnalysisCardProps {
  stats: ChatStats;
}

export function SorryAnalysisCard({ stats }: SorryAnalysisCardProps) {
  const userStats = stats.mostApologeticUser;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who Says Sorry More?</CardTitle>
      </CardHeader>
      <CardContent>
        {!userStats ? (
          <p className="text-muted-foreground">
            Not enough data to analyze apologies
          </p>
        ) : stats.equalApologies ? (
          <p className="text-muted-foreground">Not enough data (equal apologies)</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CircleCheckBig className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {stats.mostApologeticUser?.user}
                </p>
                <p className="text-muted-foreground text-sm">
                  Says sorry more often
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm">
                  {userStats.user} ({userStats.apologies} times)
                </span>
                <span className="text-sm font-medium">
                  {userStats.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${userStats.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Most common phrase:</span>
              <span className="font-medium">&quot;{userStats.mostCommonSorry}&quot;</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}