import { Suspense } from "react";
import { ChatStats } from "@/types";
import { SorryAnalysisCard } from "./sorry-analysis-card";
import { CommonPhrasesCard } from "./common-phrases-card";
import { OverusedPhrasesCard } from "./overused-phrases-card";

interface PhraseAnalysisProps {
  stats: ChatStats;
}

export function PhraseAnalysis({ stats }: PhraseAnalysisProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      }
    >
      <div className="space-y-6">
        <SorryAnalysisCard stats={stats} />
        <CommonPhrasesCard stats={stats} />
        <OverusedPhrasesCard stats={stats} />
      </div>
    </Suspense>
  );
}