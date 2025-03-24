import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ChatStats } from "@/types";

const WordCloud = dynamic(() => import("@/components/charts/word-cloud"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

interface CommonPhrasesCardProps {
  stats: ChatStats;
}

export function CommonPhrasesCard({ stats }: CommonPhrasesCardProps) {
  return (
    <div className="mb-6">
      <Suspense
        fallback={
          <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
        }
      >
        <WordCloud
          data={(stats?.commonPhrases ?? []).map((phrase) => ({
            text: phrase.text,
            value: phrase.count,
          }))}
          title="Common Phrases"
          height={300}
        />
      </Suspense>
    </div>
  );
}