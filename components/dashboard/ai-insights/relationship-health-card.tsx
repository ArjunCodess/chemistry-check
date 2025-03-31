import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface RelationshipHealthCardProps {
  stats: ChatStats;
}

export function RelationshipHealthCard({ stats }: RelationshipHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Health Score</CardTitle>
        <CardDescription>
          AI evaluation of the overall communication quality and balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.relationshipHealthScore ? (
          <div className="space-y-6">
            {/* Overall score meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Health</span>
                <span className="font-medium">
                  {stats.relationshipHealthScore.overall}/100
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    stats.relationshipHealthScore.overall >= 80
                      ? "bg-green-500"
                      : stats.relationshipHealthScore.overall >= 60
                      ? "bg-yellow-500"
                      : stats.relationshipHealthScore.overall >= 40
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${stats.relationshipHealthScore.overall}%`,
                  }}
                />
              </div>
            </div>

            {/* Detail scores */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Balance</span>
                    <span>
                      {stats.relationshipHealthScore.details.balance}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${stats.relationshipHealthScore.details.balance}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Engagement</span>
                    <span>
                      {stats.relationshipHealthScore.details.engagement}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${stats.relationshipHealthScore.details.engagement}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Positivity</span>
                    <span>
                      {stats.relationshipHealthScore.details.positivity}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${stats.relationshipHealthScore.details.positivity}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Consistency</span>
                    <span>
                      {stats.relationshipHealthScore.details.consistency}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${stats.relationshipHealthScore.details.consistency}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Red flags */}
            {stats.relationshipHealthScore.redFlags &&
              stats.relationshipHealthScore.redFlags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-red-500">
                    Potential Red Flags
                  </h4>
                  <ul className="space-y-1 list-disc pl-5 text-xs text-red-600">
                    {stats.relationshipHealthScore.redFlags.map(
                      (flag, index) => (
                        <li key={index}>{flag}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">
              AI-powered relationship health analysis will appear here after chat upload.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 