import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStats } from "@/types";

interface OverusedPhrasesCardProps {
  stats: ChatStats;
}

export function OverusedPhrasesCard({ stats }: OverusedPhrasesCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Overused Phrases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats?.overusedPhrases ?? {}).map(
              ([user, phrases]) => (
                <div key={user} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-medium mb-2">{user}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {phrases.map((phrase: { text: string; count: number }) => (
                      <div
                        key={phrase.text}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <p className="text-sm font-medium">
                          &ldquo;{phrase.text}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500">
                          {phrase.count} times
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}