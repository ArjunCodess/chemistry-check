import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface AttachmentStyleCardProps {
  stats: ChatStats;
}

export function AttachmentStyleCard({ stats }: AttachmentStyleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachment Style Analysis</CardTitle>
        <CardDescription>
          AI-powered analysis of each person&apos;s attachment style based on communication patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.attachmentStyles &&
        Object.keys(stats.attachmentStyles).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {Object.entries(stats.attachmentStyles).map(
              ([user, data]) => (
                <div
                  key={user}
                  className="space-y-4 border p-4 rounded-lg"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{user}</span>
                      <span className="font-medium">
                        {data.primaryStyle}
                        {data.secondaryStyle && ` / ${data.secondaryStyle}`}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Confidence: {data.confidence}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Secure</span>
                        <span>{data.details.secure}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${data.details.secure}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Anxious</span>
                        <span>{data.details.anxious}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${data.details.anxious}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Avoidant</span>
                        <span>{data.details.avoidant}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${data.details.avoidant}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Disorganized</span>
                        <span>{data.details.disorganized}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${data.details.disorganized}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm mt-8">
                    {data.description}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">
              AI-powered attachment style analysis will appear here after chat upload.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 