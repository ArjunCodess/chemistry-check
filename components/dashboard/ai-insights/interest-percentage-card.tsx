import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface InterestPercentageCardProps {
  stats: ChatStats;
}

export function InterestPercentageCard({ stats }: InterestPercentageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Percentage</CardTitle>
        <CardDescription>
          How engaged each person is in the conversation based on various factors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.interestPercentage &&
        Object.keys(stats.interestPercentage).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(stats.interestPercentage).map(
              ([user, data]) => (
                <div
                  key={user}
                  className="space-y-4 border-b pb-4 last:border-b-0"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{user}</span>
                      <span className="font-medium">
                        {data.score}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          data.score >= 80
                            ? "bg-green-500"
                            : data.score >= 60
                            ? "bg-blue-500"
                            : data.score >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Initiation</span>
                      <span>{data.details.initiation}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Rate</span>
                      <span>{data.details.responseRate}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enthusiasm</span>
                      <span>{data.details.enthusiasm}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consistency</span>
                      <span>{data.details.consistency}/100</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">
              AI-powered interest analysis will appear here after chat upload.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 