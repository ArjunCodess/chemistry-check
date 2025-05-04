import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponseTimeStats } from "@/types";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
  ),
});

interface ResponseTimesUserDetailCardProps {
  user: string;
  rtStats: ResponseTimeStats;
}

export function ResponseTimesUserDetailCard({
  user,
  rtStats,
}: ResponseTimesUserDetailCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{user}&apos;s Response Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Response
                </p>
              </div>
              <p className="text-2xl font-bold mt-2">
                {rtStats && typeof rtStats.average === "number"
                  ? `${rtStats.average.toFixed(1)} min`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <p className="text-sm font-medium text-muted-foreground">
                  Longest Response
                </p>
              </div>
              <p className="text-2xl font-bold mt-2">
                {rtStats && typeof rtStats.longest === "number"
                  ? `${rtStats.longest.toFixed(1)} min`
                  : "N/A"}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-md"></div>
            }
          >
            <BarChart
              data={Object.entries(rtStats?.distribution ?? {}).map(
                ([category, count]) => ({
                  name: category,
                  count,
                })
              )}
              title="Response Time Distribution"
              height={250}
              multicolor={true}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
} 