import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface MostUsedWordsCardProps {
  stats: ChatStats;
}

export function MostUsedWordsCard({ stats }: MostUsedWordsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Used Words</CardTitle>
      </CardHeader>
      <CardContent>
        {Array.isArray(stats.mostUsedWords) && stats.mostUsedWords.length > 0 ? (
          <div className="space-y-3">
            {stats.mostUsedWords.map(({ word, count }, index, array) => (
              <div key={word} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">&ldquo;{word}&rdquo;</span>
                  <span className="font-semibold">{count} times</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${
                        array[0] && array[0].count
                          ? (count / array[0].count) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-neutral-500">
            No word data available
          </div>
        )}
      </CardContent>
    </Card>
  );
} 