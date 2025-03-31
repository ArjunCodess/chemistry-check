import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatStats } from "@/types";
import { Check, X } from "lucide-react";

interface MatchPercentageCardProps {
  stats: ChatStats;
}

export function MatchPercentageCard({ stats }: MatchPercentageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Compatibility</CardTitle>
        <CardDescription>
          How well matched you are based on communication styles and patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.matchPercentage ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Gauge background (full circle) */}
                <div className="absolute inset-0 rounded-full bg-slate-100"></div>
                
                {/* Gauge fill */}
                <div 
                  className="absolute inset-0 rounded-full bg-transparent"
                  style={{
                    background: `conic-gradient(${
                      stats.matchPercentage.score >= 80 ? 'rgb(34, 197, 94)' : 
                      stats.matchPercentage.score >= 60 ? 'rgb(59, 130, 246)' : 
                      stats.matchPercentage.score >= 40 ? 'rgb(234, 179, 8)' : 
                      'rgb(239, 68, 68)'
                    } ${stats.matchPercentage.score}%, transparent 0)`
                  }}
                ></div>
                
                {/* Inner white circle */}
                <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                  <span className={`text-4xl font-bold ${
                    stats.matchPercentage.score >= 80 ? 'text-green-500' : 
                    stats.matchPercentage.score >= 60 ? 'text-blue-500' : 
                    stats.matchPercentage.score >= 40 ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}>
                    {stats.matchPercentage.score}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Why you're compatible */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-green-600 flex items-center gap-1 mb-3">
                  <Check size={16} className="inline" />
                  Why You&apos;re Compatible
                </h3>
                <ul className="space-y-2 text-sm">
                  {stats.matchPercentage.compatibility.reasons.map((reason, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-green-500 flex-shrink-0">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Why you might not be compatible */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-red-600 flex items-center gap-1 mb-3">
                  <X size={16} className="inline" />
                  Potential Incompatibilities
                </h3>
                <ul className="space-y-2 text-sm">
                  {stats.matchPercentage.compatibility.incompatibilities.map((incompatibility, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-red-500 flex-shrink-0">•</span>
                      <span>{incompatibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 text-center mt-4">
              Confidence level: {stats.matchPercentage.confidence}%
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">
              AI-powered match compatibility analysis will appear here after chat upload.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 