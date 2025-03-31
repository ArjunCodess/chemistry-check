import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface InterestPercentageCardProps {
  stats: ChatStats;
}

export function InterestPercentageCard({ stats }: InterestPercentageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Level</CardTitle>
        <CardDescription>
          How engaged each person is in the conversation based on various factors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.interestPercentage &&
        Object.keys(stats.interestPercentage).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats.interestPercentage).map(([user, data]) => (
              <div key={user} className="border p-4 rounded-lg">
                <div className="flex flex-col items-center mb-6">
                  <div className="text-center mb-4 text-sm font-medium">{user}</div>
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Gauge background (full circle) */}
                    <div className="absolute inset-0 rounded-full bg-slate-100"></div>
                    
                    {/* Gauge fill */}
                    <div 
                      className="absolute inset-0 rounded-full bg-transparent"
                      style={{
                        background: `conic-gradient(${
                          data.score >= 80 ? 'rgb(236, 72, 153)' : 
                          data.score >= 60 ? 'rgb(59, 130, 246)' : 
                          data.score >= 40 ? 'rgb(234, 179, 8)' : 
                          'rgb(239, 68, 68)'
                        } ${data.score}%, transparent 0)`
                      }}
                    ></div>
                    
                    {/* Inner white circle */}
                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                      <span className={`text-3xl font-bold ${
                        data.score >= 80 ? 'text-pink-500' : 
                        data.score >= 60 ? 'text-blue-500' : 
                        data.score >= 40 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {data.score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Initiation</span>
                    <span>{data.details.initiation}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${data.details.initiation}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Response Rate</span>
                    <span>{data.details.responseRate}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${data.details.responseRate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Enthusiasm</span>
                    <span>{data.details.enthusiasm}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${data.details.enthusiasm}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Consistency</span>
                    <span>{data.details.consistency}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${data.details.consistency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
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