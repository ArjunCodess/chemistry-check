"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { formatFileSize } from "@/lib/format-utils";

// Loading fallback component for tab transitions
const TabLoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

// Dynamically import charts with suspense
const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

const DistributionChart = dynamic(
  () => import("@/components/charts/distribution-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
    ),
  }
);

// New chart components for Phase 2
const LineChart = dynamic(() => import("@/components/charts/line-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

const WordCloud = dynamic(() => import("@/components/charts/word-cloud"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

const GapAnalysis = dynamic(() => import("@/components/charts/gap-analysis"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

// Define types from our enhanced chat parser
interface ResponseTimeStats {
  average: number;
  longest: number;
  distribution: {
    "0-5min": number;
    "5-15min": number;
    "15-30min": number;
    "30min-1hour": number;
    "1hour+": number;
  };
}

interface MediaStats {
  total: number;
  byType: {
    images: number;
    videos: number;
    documents: number;
    stickers: number;
  };
  totalSize: number;
  byUser: Record<
    string,
    {
      total: number;
      byType: {
        images: number;
        videos: number;
        documents: number;
        stickers: number;
      };
      totalSize: number;
    }
  >;
}

interface EmojiCombination {
  emojis: string[];
  count: number;
}

interface EmojiStats {
  frequency: Record<string, number>;
  byUser: Record<string, Record<string, number>>;
  combinations: EmojiCombination[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface ChatStats {
  totalMessages: number;
  messagesByUser: Record<string, number>;
  totalWords: number;
  wordsByUser: Record<string, number>;
  mostUsedWords: Array<{ word: string; count: number }>;
  mostUsedEmojis: Array<{ emoji: string; count: number }>;
  responseTimes: Record<string, ResponseTimeStats>;
  mediaStats: MediaStats;
  emojiStats: EmojiStats;
  editedMessages: {
    total: number;
    byUser: Record<string, number>;
  };
  commonPhrases: Array<{ text: string; count: number }>;
  overusedPhrases: Record<string, Array<{ text: string; count: number }>>;
  gapTrends: Array<{ time: string; duration: number }>;
  gapAnalysis: Record<string, Array<{ time: string; duration: number }>>;
  biggestGaps: Array<{ user: string; duration: number; date: string }>;
  wordFrequency: Record<string, number>;
  emojiFrequency: Record<string, number>;
  wordFrequencyByUser: Record<string, Record<string, number>>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("chatStats");

      if (!savedStats) {
        toast.error("No chat data found", {
          description: "Please upload a chat file first",
          duration: 4000,
          className: "bg-white text-black",
          descriptionClassName: "text-black",
        });
        router.push("/");
        return;
      }

      // Parse stats from localStorage
      const parsedStats = JSON.parse(savedStats);
      console.log("Loaded stats from localStorage:", {
        totalMessages: parsedStats.totalMessages,
        totalWords: parsedStats.totalWords,
      });

      setStats(parsedStats);
    } catch (error) {
      console.error("Error loading chat stats:", error);
      toast.error("Failed to load chat data", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 4000,
        className: "bg-white text-black",
        descriptionClassName: "text-black",
      });
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    console.error("Stats object is null after loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No data available</div>
      </div>
    );
  }

  // Filter out any "unknown" user data if it exists
  if (stats.messagesByUser && stats.messagesByUser.unknown) {
    delete stats.messagesByUser.unknown;
    // Recalculate total messages excluding unknown
    stats.totalMessages = Object.values(stats.messagesByUser).reduce(
      (sum, count) => sum + (count as number),
      0
    );
  }

  // Create defaults for all the required fields to ensure we don't crash
  const safeStats = stats
    ? {
        ...stats,
        totalMessages: stats.totalMessages || 0,
        totalWords: stats.totalWords || 0,
        messagesByUser: stats.messagesByUser || {},
        wordsByUser: stats.wordsByUser || {},
        editedMessages: stats.editedMessages || { total: 0, byUser: {} },
        mediaStats: stats.mediaStats || {
          total: 0,
          byType: { images: 0, videos: 0, documents: 0, stickers: 0 },
          totalSize: 0,
          byUser: {},
        },
        emojiStats: stats.emojiStats || {
          frequency: {},
          byUser: {},
          combinations: [],
          sentiment: { positive: 0, negative: 0, neutral: 0 },
        },
        mostUsedWords: stats.mostUsedWords || [],
        mostUsedEmojis: stats.mostUsedEmojis || [],
        wordFrequency: stats.wordFrequency || {},
        emojiFrequency: stats.emojiFrequency || {},
        responseTimes: stats.responseTimes || {},
        commonPhrases: stats.commonPhrases || [],
        overusedPhrases: stats.overusedPhrases || {},
        gapTrends: stats.gapTrends || [],
        gapAnalysis: stats.gapAnalysis || {},
        biggestGaps: stats.biggestGaps || [],
        wordFrequencyByUser: stats.wordFrequencyByUser || {},
      }
    : {
        totalMessages: 0,
        totalWords: 0,
        messagesByUser: {},
        wordsByUser: {},
        editedMessages: { total: 0, byUser: {} },
        mediaStats: {
          total: 0,
          byType: { images: 0, videos: 0, documents: 0, stickers: 0 },
          totalSize: 0,
          byUser: {},
        },
        emojiStats: {
          frequency: {},
          byUser: {},
          combinations: [],
          sentiment: { positive: 0, negative: 0, neutral: 0 },
        },
        mostUsedWords: [],
        mostUsedEmojis: [],
        wordFrequency: {},
        emojiFrequency: {},
        responseTimes: {},
        commonPhrases: [],
        overusedPhrases: {},
        gapTrends: [],
        gapAnalysis: {},
        biggestGaps: [],
        wordFrequencyByUser: {},
      };

  console.log("Stats loaded successfully:", {
    totalMessages: safeStats.totalMessages,
    totalWords: safeStats.totalWords,
    editedMessages: safeStats.editedMessages?.total,
    avgWordsPerMessage:
      safeStats.totalMessages > 0
        ? safeStats.totalWords / safeStats.totalMessages
        : 0,
  });

  // Data for pie charts
  const mediaByTypeData = [
    { name: "Images", value: safeStats?.mediaStats?.byType?.images ?? 0 },
    { name: "Videos", value: safeStats?.mediaStats?.byType?.videos ?? 0 },
    { name: "Documents", value: safeStats?.mediaStats?.byType?.documents ?? 0 },
    { name: "Stickers", value: safeStats?.mediaStats?.byType?.stickers ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chat Analytics</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          Upload New Chat
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="basic">Basic Stats</TabsTrigger>
          <TabsTrigger value="time">Response Times</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="emoji">Emoji Analysis</TabsTrigger>
          <TabsTrigger value="phrases">Phrase Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
        </TabsList>

        {/* Basic Stats Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Messages:
                      </span>
                      <span className="font-semibold">
                        {safeStats.totalMessages.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Words:</span>
                      <span className="font-semibold">
                        {safeStats.totalWords.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Edited Messages:
                      </span>
                      <span className="font-semibold">
                        {(
                          safeStats.editedMessages?.total || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Avg Words/Message:
                      </span>
                      <span className="font-semibold">
                        {safeStats.totalMessages > 0
                          ? (
                              safeStats.totalWords / safeStats.totalMessages
                            ).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Media:</span>
                      <span className="font-semibold">
                        {(safeStats.mediaStats?.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Size:</span>
                      <span className="font-semibold">
                        {formatFileSize(safeStats.mediaStats?.totalSize || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Images:</span>
                      <span className="font-semibold">
                        {(
                          safeStats.mediaStats?.byType?.images || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Videos:</span>
                      <span className="font-semibold">
                        {(
                          safeStats.mediaStats?.byType?.videos || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emoji Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Unique Emojis:
                      </span>
                      <span className="font-semibold">
                        {
                          Object.keys(safeStats?.emojiStats?.frequency || {})
                            .length
                        }
                      </span>
                    </div>
                    {Array.isArray(safeStats?.mostUsedEmojis) &&
                      safeStats.mostUsedEmojis
                        .slice(0, 3)
                        .map(({ emoji, count }) => (
                          <div
                            key={emoji}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm font-medium">
                              {emoji}:
                            </span>
                            <span className="font-semibold">{count} times</span>
                          </div>
                        ))}
                    {(!Array.isArray(safeStats?.mostUsedEmojis) ||
                      safeStats.mostUsedEmojis.length === 0) && (
                      <div className="text-sm text-gray-500">
                        No emoji data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(safeStats.responseTimes || {}).map(
                      ([user, rtStats]) => (
                        <div
                          key={user}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium">{user}:</span>
                          <span className="font-semibold">
                            {rtStats && typeof rtStats.average === "number"
                              ? `${rtStats.average.toFixed(1)} min`
                              : "N/A"}
                          </span>
                        </div>
                      )
                    )}
                    {Object.keys(safeStats.responseTimes || {}).length ===
                      0 && (
                      <div className="text-sm text-gray-500">
                        No response time data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages by User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(safeStats.messagesByUser).map(
                      ([user, count]) => (
                        <div key={user} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{user}:</span>
                            <span className="font-semibold">
                              {count} messages
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4">
                            <div
                              className="bg-blue-500 h-4 rounded-full"
                              style={{
                                width: `${
                                  (count / safeStats.totalMessages) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Words by User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(safeStats.wordsByUser).map(
                      ([user, count]) => (
                        <div key={user} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{user}:</span>
                            <span className="font-semibold">{count} words</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4">
                            <div
                              className="bg-green-500 h-4 rounded-full"
                              style={{
                                width: `${
                                  (count / safeStats.totalWords) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Words</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(safeStats.mostUsedWords) &&
                  safeStats.mostUsedWords.length > 0 ? (
                    <div className="space-y-3">
                      {safeStats.mostUsedWords.map(
                        ({ word, count }, index, array) => (
                          <div key={word} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                &ldquo;{word}&rdquo;
                              </span>
                              <span className="font-semibold">
                                {count} times
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
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
                        )
                      )}
                    </div>
                  ) : (
                    <div className="h-64 w-full flex items-center justify-center text-gray-500">
                      No word data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Most Used Emojis</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <Suspense
                    fallback={
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                    }
                  >
                    <BarChart
                      data={(safeStats?.mostUsedEmojis || [])
                        .slice(0, 10)
                        .map((item) => ({
                          name: item.emoji,
                          count: item.count,
                        }))}
                      title="Emoji Usage"
                      height={280}
                      barColor="hsl(var(--chart-3))"
                      multicolor={true}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Most Used Words by User</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.keys(safeStats.wordsByUser || {}).map(
                    (user, userIndex) => {
                      // Get words frequency for this specific user
                      const userWords = Object.entries(
                        safeStats.wordFrequencyByUser[user] || {}
                      )
                        .filter(([word]) => word.length > 2) // Filter out short words
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([word, count]) => ({
                          name: word,
                          count: count as number,
                        }));

                      // Find max count for scaling
                      const maxCount =
                        userWords.length > 0 ? userWords[0].count : 0;

                      // Choose a color based on user index
                      const colors = [
                        "bg-amber-500",
                        "bg-emerald-500",
                        "bg-rose-500",
                        "bg-indigo-500",
                        "bg-fuchsia-500",
                      ];
                      const barColor = colors[userIndex % colors.length];

                      return (
                        <div
                          key={`words-${user}`}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <h3 className="text-lg font-medium mb-3">{user}</h3>
                          <div className="space-y-3">
                            {userWords.map((item, i) => (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    &ldquo;{item.name}&rdquo;
                                  </span>
                                  <span className="font-semibold">
                                    {item.count} times
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                  <div
                                    className={`${barColor} h-3 rounded-full`}
                                    style={{
                                      width: `${
                                        maxCount
                                          ? (item.count / maxCount) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Most Used Emojis by User</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.keys(safeStats.emojiStats?.byUser || {}).map(
                    (user, userIndex) => {
                      // Get emojis frequency for this user
                      const userEmojis = Object.entries(
                        safeStats.emojiStats?.byUser[user] || {}
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([emoji, count]) => ({
                          emoji,
                          count: count as number,
                        }));

                      // Find max count for scaling
                      const maxCount =
                        userEmojis.length > 0 ? userEmojis[0].count : 0;

                      // Choose a color based on user index
                      const colors = [
                        "bg-cyan-500",
                        "bg-orange-500",
                        "bg-teal-500",
                        "bg-pink-500",
                        "bg-violet-500",
                      ];
                      const barColor = colors[userIndex % colors.length];

                      return (
                        <div
                          key={`emojis-${user}`}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <h3 className="text-lg font-medium mb-3">{user}</h3>
                          <div className="space-y-3">
                            {userEmojis.map((item, i) => (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {item.emoji}
                                  </span>
                                  <span className="font-semibold">
                                    {item.count} times
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                  <div
                                    className={`${barColor} h-3 rounded-full`}
                                    style={{
                                      width: `${
                                        maxCount
                                          ? (item.count / maxCount) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        {/* Response Times Tab */}
        <TabsContent value="time" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>
                      • Response times are calculated between messages from
                      different users
                    </p>
                    <p>
                      • Long response times ({">"}60 min) are considered
                      &ldquo;ghosting&rdquo;
                    </p>
                    <p>• Distribution categories:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Quick (0-5 min): Immediate responses</li>
                      <li>Normal (5-15 min): Regular conversation pace</li>
                      <li>Slow (15-30 min): Delayed responses</li>
                      <li>Very Slow (30-60 min): Significant delays</li>
                      <li>
                        Ghosting ({">"}60 min): Extended periods without
                        response
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(safeStats?.responseTimes ?? {}).map(
                ([user, rtStats]) => (
                  <Card key={user}>
                    <CardHeader>
                      <CardTitle>{user}&apos;s Response Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">
                              Average Response
                            </p>
                            <p className="text-xl font-semibold">
                              {rtStats && typeof rtStats.average === "number"
                                ? `${rtStats.average.toFixed(1)} min`
                                : "N/A"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">
                              Longest Response
                            </p>
                            <p className="text-xl font-semibold">
                              {rtStats && typeof rtStats.longest === "number"
                                ? `${rtStats.longest.toFixed(1)} min`
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <Suspense
                          fallback={
                            <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                          }
                        >
                          <DistributionChart
                            data={Object.entries(
                              rtStats?.distribution ?? {}
                            ).map(([category, count]) => ({
                              category,
                              count,
                            }))}
                            title="Response Time Distribution"
                            height={250}
                          />
                        </Suspense>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </Suspense>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Media Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Media</p>
                        <p className="text-xl font-semibold">
                          {(safeStats?.mediaStats?.total ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Size</p>
                        <p className="text-xl font-semibold">
                          {formatFileSize(
                            safeStats?.mediaStats?.totalSize ?? 0
                          )}
                        </p>
                      </div>
                    </div>

                    <Suspense
                      fallback={
                        <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                      }
                    >
                      <PieChart
                        data={mediaByTypeData}
                        title="Media by Type"
                        height={250}
                      />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media by User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(safeStats?.mediaStats?.byUser ?? {}).map(
                      ([user, userMedia]) => (
                        <div
                          key={user}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <h3 className="text-lg font-medium mb-2">{user}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Images</p>
                              <p className="font-medium">
                                {userMedia?.byType?.images ?? 0}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Videos</p>
                              <p className="font-medium">
                                {userMedia?.byType?.videos ?? 0}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Documents</p>
                              <p className="font-medium">
                                {userMedia?.byType?.documents ?? 0}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Stickers</p>
                              <p className="font-medium">
                                {userMedia?.byType?.stickers ?? 0}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm">
                            Total Size:{" "}
                            <span className="font-medium">
                              {formatFileSize(userMedia?.totalSize ?? 0)}
                            </span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        {/* Emoji Analysis Tab */}
        <TabsContent value="emoji" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Emojis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                    }
                  >
                    <BarChart
                      data={(safeStats?.mostUsedEmojis || [])
                        .slice(0, 10)
                        .map((item) => ({
                          name: item.emoji,
                          count: item.count,
                        }))}
                      title="Emoji Usage"
                      height={250}
                      barColor="hsl(var(--chart-3))"
                      multicolor={true}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emoji Usage by User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(safeStats?.emojiStats?.byUser || {}).map(
                      ([user, emojis]) => (
                        <div
                          key={user}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <h3 className="text-lg font-medium mb-2">{user}</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {Object.entries(emojis || {})
                              .sort(
                                ([, countA], [, countB]) =>
                                  Number(countB) - Number(countA)
                              )
                              .slice(0, 5)
                              .map(([emoji, count]) => (
                                <div
                                  key={emoji}
                                  className="flex flex-col items-center p-2 bg-gray-50 rounded-lg"
                                >
                                  <span className="text-2xl">{emoji}</span>
                                  <span className="text-xs text-gray-500">
                                    {count}
                                  </span>
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
          </Suspense>
        </TabsContent>

        {/* New Phrase Analysis Tab */}
        <TabsContent value="phrases" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Phrases</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                    }
                  >
                    <WordCloud
                      data={(safeStats?.commonPhrases ?? []).map((phrase) => ({
                        text: phrase.text,
                        value: phrase.count,
                      }))}
                      title="Common Phrases"
                      height={350}
                    />
                  </Suspense>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overused Phrases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(safeStats?.overusedPhrases ?? {}).map(
                      ([user, phrases]) => (
                        <div
                          key={user}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <h3 className="text-lg font-medium mb-2">{user}</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {phrases.map(
                              (phrase: { text: string; count: number }) => (
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
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        {/* New Gap Analysis Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Gap Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                    }
                  >
                    <LineChart
                      data={safeStats?.gapTrends ?? []}
                      dataKeys={Object.keys(safeStats?.messagesByUser ?? {})}
                      title="Response Time Trends"
                      height={300}
                      xAxisKey="time"
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {Object.entries(safeStats?.gapAnalysis ?? {}).map(
                ([user, gapData]) => (
                  <Suspense
                    key={user}
                    fallback={
                      <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                    }
                  >
                    <GapAnalysis
                      data={(gapData ?? []).map(
                        (gap: { time: string; duration: number }) => ({
                          time: gap.time,
                          gap: gap.duration,
                          user: user,
                        })
                      )}
                      title={`${user}'s Response Gaps`}
                      height={300}
                    />
                  </Suspense>
                )
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Biggest Message Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(safeStats?.biggestGaps ?? []).map(
                      (
                        gap: { user: string; duration: number; date: string },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 border-b pb-3 last:border-b-0"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{gap.user}</p>
                            <p className="text-sm text-gray-500">
                              {gap.duration.toFixed(1)} minutes on{" "}
                              {new Date(gap.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}