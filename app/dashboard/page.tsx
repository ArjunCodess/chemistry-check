"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { formatFileSize } from "@/lib/format-utils";
import { Clock } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";

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

const WordCloud = dynamic(() => import("@/components/charts/word-cloud"), {
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
    animations: number;
    links: number;
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
        animations: number;
        links: number;
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
  longestMessages: Record<
    string,
    Array<{ text: string; length: number; date: string }>
  >;
  messagesByHour?: Record<string, number>;
  messagesByDay?: Record<string, number>;
  messagesByMonth?: Record<string, number>;
  sorryByUser?: Record<string, number>;
  aiSummary?: string;
  relationshipHealthScore?: {
    overall: number;
    details: {
      balance: number;
      engagement: number;
      positivity: number;
      consistency: number;
    };
    redFlags?: string[];
  };
  interestPercentage?: Record<string, {
    score: number;
    details: {
      initiation: number;
      responseRate: number;
      enthusiasm: number;
      consistency: number;
    };
  }>;
  cookedStatus?: {
    isCooked: boolean;
    user: string;
    confidence: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);
  const router = useRouter();
  // Track which messages are expanded
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, Record<number, boolean>>
  >({});
  // Track active tab for mobile nav
  const [activeTab, setActiveTab] = useState("basic");
  // Track drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle message expansion with improved logic
  const toggleMessageExpand = useCallback(
    (user: string, index: number) => {
      console.log("Toggling message:", { user, index });
      console.log("Before:", expandedMessages);

      setExpandedMessages((prev) => {
        const newState = {
          ...prev,
          [user]: {
            ...(prev[user] || {}),
            [index]: !prev[user]?.[index],
          },
        };

        console.log("After:", newState);
        return newState;
      });
    },
    [expandedMessages]
  );

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("chatStats");

      if (!savedData) {
        toast.error("No chat data found");
        router.push("/");
        return;
      }

      // Parse data from localStorage
      const parsedData = JSON.parse(savedData);

      // Check if the data has the new format with stats and timestamp
      const parsedStats = parsedData.stats ? parsedData.stats : parsedData;
      const timestamp = parsedData.timestamp || null;

      console.log("Loaded stats from localStorage:", {
        totalMessages: parsedStats.totalMessages,
        totalWords: parsedStats.totalWords,
        cachedAt: timestamp,
      });

      // Remove all sample data - don't add any fake data

      setStats(parsedStats);
      setCacheTimestamp(timestamp);
    } catch (error) {
      console.error("Error loading chat stats:", error);
      toast.error("Failed to load chat data");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleUploadNewChat = () => {
    // Don't clear the cache here so it's preserved until a new chat is uploaded
    router.push("/");
  };

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
          byType: {
            images: 0,
            videos: 0,
            documents: 0,
            stickers: 0,
            animations: 0,
            links: 0,
          },
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
        longestMessages: stats.longestMessages || {},
        sorryByUser: stats.sorryByUser || {},
      }
    : {
        totalMessages: 0,
        totalWords: 0,
        messagesByUser: {},
        wordsByUser: {},
        editedMessages: { total: 0, byUser: {} },
        mediaStats: {
          total: 0,
          byType: {
            images: 0,
            videos: 0,
            documents: 0,
            stickers: 0,
            animations: 0,
            links: 0,
          },
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
        longestMessages: {},
        sorryByUser: {},
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
    { name: "GIFs", value: safeStats?.mediaStats?.byType?.animations ?? 0 },
    { name: "Documents", value: safeStats?.mediaStats?.byType?.documents ?? 0 },
    { name: "Stickers", value: safeStats?.mediaStats?.byType?.stickers ?? 0 },
    { name: "Links", value: safeStats?.mediaStats?.byType?.links ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Chat Analytics
          </h1>
          {cacheTimestamp && (
            <p className="text-sm text-gray-500 mt-1">
              Analysis from {new Date(cacheTimestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={handleUploadNewChat} variant="outline">
          Upload New Chat
        </Button>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs
          defaultValue="basic"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="basic">Basic Stats</TabsTrigger>
            <TabsTrigger value="time">Response Times</TabsTrigger>
            <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="emoji">Emoji Analysis</TabsTrigger>
            <TabsTrigger value="phrases">Phrase Analysis</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mb-6">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
            >
              <span>
                {activeTab === "basic"
                  ? "Basic Stats"
                  : activeTab === "time"
                  ? "Response Times"
                  : activeTab === "media"
                  ? "Media"
                  : activeTab === "emoji"
                  ? "Emoji Analysis"
                  : activeTab === "phrases"
                  ? "Phrase Analysis"
                  : activeTab === "ai"
                  ? "AI Insights"
                  : "Activity Patterns"}
              </span>
              <Menu className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[32rem] px-4">
            <div className="grid grid-cols-1 gap-4 pt-14">
              <Button
                variant={activeTab === "basic" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("basic");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Basic Stats
              </Button>
              <Button
                variant={activeTab === "time" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("time");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Response Times
              </Button>
              <Button
                variant={activeTab === "media" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("media");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Media
              </Button>
              <Button
                variant={activeTab === "emoji" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("emoji");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Emoji Analysis
              </Button>
              <Button
                variant={activeTab === "phrases" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("phrases");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Phrase Analysis
              </Button>
              <Button
                variant={activeTab === "activity" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("activity");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                Activity Patterns
              </Button>
              <Button
                variant={activeTab === "ai" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("ai");
                  setDrawerOpen(false);
                }}
                className="justify-start"
              >
                AI Insights
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Tabs Content (Works with both desktop and mobile) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

            {/* Add Longest Messages card */}
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Longest Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(safeStats.longestMessages || {}).map(
                    ([user, messages]) => (
                      <div key={user} className="border-b pb-4 last:border-b-0">
                        <h3 className="text-lg font-medium mb-3">{user}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(Array.isArray(messages)
                            ? messages
                            : [messages]
                          ).map((message, index) => {
                            // Ensure message.text is a string
                            const messageText =
                              typeof message.text === "string"
                                ? message.text
                                : String(message.text || "");

                            // Get expansion state with fallback
                            const isExpanded = Boolean(
                              expandedMessages[user]?.[index]
                            );
                            console.log(
                              `Message ${user}-${index} expanded:`,
                              isExpanded
                            );

                            // Only truncate if longer than 100 chars and not expanded
                            const shouldTruncate =
                              messageText.length > 100 && !isExpanded;
                            const displayText = shouldTruncate
                              ? messageText.substring(0, 100) + "..."
                              : messageText;

                            return (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-gray-500">
                                    {message.date || "Unknown date"}
                                  </span>
                                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {message.length} words
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                  &ldquo;{displayText}&rdquo;
                                </p>
                                {messageText.length > 100 && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="mt-2 h-auto p-0"
                                    onClick={() => {
                                      console.log(
                                        "Button clicked for",
                                        user,
                                        index
                                      );
                                      toggleMessageExpand(user, index);
                                    }}
                                  >
                                    {isExpanded ? "Show Less" : "Read More"}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                  {Object.keys(safeStats.longestMessages || {}).length ===
                    0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No message data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>

        {/* Response Times Tab */}
        <TabsContent value="time" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      Response Time Overview
                    </CardTitle>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Response times show how quickly users reply to each
                      other&apos;s messages. Faster response times typically
                      indicate more engaged conversations.
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Quick
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          0-5 min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Immediate responses
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Normal
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          5-15 min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Regular conversation
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Slow
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          15-30 min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Delayed responses
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Very Slow
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          30-60 min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Significant delays
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Ghosting
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          60+ min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Extended silence
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User summary cards */}
                {Object.entries(safeStats?.responseTimes ?? {}).map(
                  ([user, rtStats]) => {
                    // Get response time distribution for visualization
                    const distribution = rtStats?.distribution ?? {};
                    const totalResponses = Object.values(distribution).reduce(
                      (sum, val) => sum + (val as number),
                      0
                    );

                    // Calculate quick response percentage
                    const quickResponsePercentage =
                      totalResponses > 0
                        ? Math.round(
                            ((distribution["0-5min"] || 0) / totalResponses) *
                              100
                          )
                        : 0;

                    // Calculate ghosting percentage
                    const ghostingPercentage =
                      totalResponses > 0
                        ? Math.round(
                            ((distribution["1hour+"] || 0) / totalResponses) *
                              100
                          )
                        : 0;

                    return (
                      <Card
                        key={`summary-${user}`}
                        className="overflow-hidden w-full"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{user}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-3xl font-bold">
                                {rtStats && typeof rtStats.average === "number"
                                  ? `${rtStats.average.toFixed(1)}`
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                avg. minutes to respond
                              </div>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-primary">
                                {quickResponsePercentage}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                quick responses
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            {/* Quick responses (0-5min) */}
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${
                                  ((distribution["0-5min"] || 0) /
                                    totalResponses) *
                                  100
                                }%`,
                              }}
                            ></div>
                            {/* Normal responses (5-15min) */}
                            <div
                              className="bg-blue-400 h-full"
                              style={{
                                width: `${
                                  ((distribution["5-15min"] || 0) /
                                    totalResponses) *
                                  100
                                }%`,
                              }}
                            ></div>
                            {/* Slow responses (15-30min) */}
                            <div
                              className="bg-amber-400 h-full"
                              style={{
                                width: `${
                                  ((distribution["15-30min"] || 0) /
                                    totalResponses) *
                                  100
                                }%`,
                              }}
                            ></div>
                            {/* Very slow responses (30min-1hour) */}
                            <div
                              className="bg-orange-400 h-full"
                              style={{
                                width: `${
                                  ((distribution["30min-1hour"] || 0) /
                                    totalResponses) *
                                  100
                                }%`,
                              }}
                            ></div>
                            {/* Ghosting (1hour+) */}
                            <div
                              className="bg-red-400 h-full"
                              style={{
                                width: `${
                                  ((distribution["1hour+"] || 0) /
                                    totalResponses) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>Quick</span>
                            <span>Ghosting: {ghostingPercentage}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(safeStats?.responseTimes ?? {}).map(
                  ([user, rtStats]) => (
                    <Card key={`detail-${user}`} className="overflow-hidden">
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
                              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
                            }
                          >
                            <BarChart
                              data={Object.entries(
                                rtStats?.distribution ?? {}
                              ).map(([category, count]) => ({
                                name: category,
                                count,
                              }))}
                              title="Response Time Distribution"
                              height={250}
                              multicolor={true}
                            />
                          </Suspense>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
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
                      <PieChart data={mediaByTypeData} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media by User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(safeStats?.mediaStats?.byUser ?? {}).map(
                      ([user, userMedia]) => {
                        // Calculate total media for this user
                        const userTotal = userMedia?.total ?? 0;
                        // Calculate percentage compared to overall media
                        const percentOfTotal = safeStats?.mediaStats?.total
                          ? Math.round(
                              (userTotal / safeStats.mediaStats.total) * 100
                            )
                          : 0;

                        return (
                          <div
                            key={user}
                            className="border border-border rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-lg font-medium">{user}</h3>
                              <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                                {percentOfTotal}% of total
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1 text-sm">
                                <span>
                                  Total Media: <strong>{userTotal}</strong>
                                </span>
                                <span>
                                  Size:{" "}
                                  <strong>
                                    {formatFileSize(userMedia?.totalSize ?? 0)}
                                  </strong>
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${percentOfTotal}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {[
                                {
                                  name: "Images",
                                  value: userMedia?.byType?.images ?? 0,
                                  icon: "📷",
                                },
                                {
                                  name: "Videos",
                                  value: userMedia?.byType?.videos ?? 0,
                                  icon: "🎬",
                                },
                                {
                                  name: "GIFs",
                                  value: userMedia?.byType?.animations ?? 0,
                                  icon: "✨",
                                },
                                {
                                  name: "Documents",
                                  value: userMedia?.byType?.documents ?? 0,
                                  icon: "📄",
                                },
                                {
                                  name: "Stickers",
                                  value: userMedia?.byType?.stickers ?? 0,
                                  icon: "🔖",
                                },
                                {
                                  name: "Links",
                                  value: userMedia?.byType?.links ?? 0,
                                  icon: "🔗",
                                },
                              ].map((item) => (
                                <div
                                  key={item.name}
                                  className="bg-gray-50 p-3 rounded-md flex gap-2 items-center"
                                >
                                  <span className="text-lg">{item.icon}</span>
                                  <div>
                                    <p className="text-xs text-gray-500 leading-tight">
                                      {item.name}
                                    </p>
                                    <p className="font-medium">{item.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
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
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(emojis || {})
                              .sort(
                                ([, countA], [, countB]) =>
                                  Number(countB) - Number(countA)
                              )
                              .slice(0, 6)
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

        {/* Phrase Analysis Tab */}
        <TabsContent value="phrases" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            {/* Who Says Sorry More card */}
            <div className="mb-6">
              <Card className="w-full flex md:flex-row justify-between">
                <CardHeader className="md:w-1/2">
                  <CardTitle className="text-lg">Who Says<br className="hidden md:block" />{" "}Sorry More?</CardTitle>
                </CardHeader>
                <CardContent className="md:text-right">
                  {safeStats?.sorryByUser && Object.keys(safeStats.sorryByUser).length > 0 ? (
                    (() => {
                      // Find user with most sorries
                      const sortedUsers = Object.entries(safeStats.sorryByUser)
                        .sort(([, a], [, b]) => (b as number) - (a as number));
                      
                      if (sortedUsers.length === 0) return <p>No apologies found in chat.</p>;
                      
                      const [topUser, topCount] = sortedUsers[0];
                      const totalSorries = Object.values(safeStats.sorryByUser).reduce((sum, count) => sum + (count as number), 0);
                      const percentage = Math.round((topCount as number) / totalSorries * 100);
                      
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-lg">{topUser}</span>
                            <p className="text-sm text-muted-foreground">
                              Said sorry {topCount} times ({percentage}% of all apologies)
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p>No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Word Cloud in full-width row */}
            <div className="mb-6">
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
                  height={300}
                />
              </Suspense>
            </div>

            {/* Overused Phrases in second row */}
            <div className="grid grid-cols-1 gap-6">
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Chat Summary Card */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>AI-Generated Chat Summary</CardTitle>
                  <CardDescription>
                    A TL;DR of what your chat is really about, including key patterns and dynamics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.aiSummary ? (
                    <div>
                      {/* Cooked Status Alert */}
                      {safeStats.cookedStatus?.isCooked && (
                        <div className="mb-6 p-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-md shadow-lg">
                          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-md" 
                              style={{ animation: "cookedTextPulse 2s infinite" }}>
                            {safeStats.cookedStatus.user} IS COOKED!
                          </h2>
                          <p className="text-sm text-center text-white mt-2 font-medium">
                            Confidence: {safeStats.cookedStatus.confidence}%
                          </p>
                          <style jsx>{`
                            @keyframes cookedTextPulse {
                              0%, 100% { transform: scale(1); }
                              50% { transform: scale(1.05); }
                            }
                          `}</style>
                        </div>
                      )}
                      <div className="p-4 bg-slate-50 rounded-lg antialiased">
                        <p className="whitespace-pre-line text-xs md:text-sm">{safeStats.aiSummary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 bg-slate-100 p-4 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-400"
                        >
                          <path d="M12 2a7.5 7.5 0 0 0-5.3 12.9L12 21l5.3-6.1A7.5 7.5 0 0 0 12 2Z" />
                          <path d="M12 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">AI Summary Not Available</h3>
                      <p className="text-slate-500 text-sm max-w-md">
                        Upload your chat history to generate an AI-powered summary of your conversation dynamics.
                      </p>
                      <Button className="mt-4" onClick={handleUploadNewChat}>Upload Chat</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Relationship Health Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Relationship Health Score</CardTitle>
                  <CardDescription>
                    AI evaluation of the overall communication quality and balance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.relationshipHealthScore ? (
                    <div className="space-y-6">
                      {/* Overall score meter */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Health</span>
                          <span className="font-medium">{safeStats.relationshipHealthScore.overall}/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              safeStats.relationshipHealthScore.overall >= 80 ? "bg-green-500" :
                              safeStats.relationshipHealthScore.overall >= 60 ? "bg-yellow-500" :
                              safeStats.relationshipHealthScore.overall >= 40 ? "bg-orange-500" : "bg-red-500"
                            }`}
                            style={{ width: `${safeStats.relationshipHealthScore.overall}%` }}
                          />
                        </div>
                      </div>

                      {/* Detail scores */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Balance</span>
                              <span>{safeStats.relationshipHealthScore.details.balance}/100</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full" 
                                style={{ width: `${safeStats.relationshipHealthScore.details.balance}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Engagement</span>
                              <span>{safeStats.relationshipHealthScore.details.engagement}/100</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full" 
                                style={{ width: `${safeStats.relationshipHealthScore.details.engagement}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Positivity</span>
                              <span>{safeStats.relationshipHealthScore.details.positivity}/100</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full" 
                                style={{ width: `${safeStats.relationshipHealthScore.details.positivity}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Consistency</span>
                              <span>{safeStats.relationshipHealthScore.details.consistency}/100</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full" 
                                style={{ width: `${safeStats.relationshipHealthScore.details.consistency}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Red flags */}
                      {safeStats.relationshipHealthScore.redFlags && 
                       safeStats.relationshipHealthScore.redFlags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-red-500">Potential Red Flags</h4>
                          <ul className="space-y-1 list-disc pl-5 text-xs text-red-600">
                            {safeStats.relationshipHealthScore.redFlags.map((flag, index) => (
                              <li key={index}>{flag}</li>
                            ))}
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

              {/* Interest Percentage Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Interest Percentage</CardTitle>
                  <CardDescription>
                    How engaged each person is in the conversation based on various factors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.interestPercentage && Object.keys(safeStats.interestPercentage).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(safeStats.interestPercentage).map(([user, data]) => (
                        <div key={user} className="space-y-4 border-b pb-4 last:border-b-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{user}</span>
                              <span className="font-medium">{data.score}/100</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  data.score >= 80 ? "bg-green-500" :
                                  data.score >= 60 ? "bg-blue-500" :
                                  data.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${data.score}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Initiation</span>
                              <span>{data.details.initiation}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Rate</span>
                              <span>{data.details.responseRate}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Enthusiasm</span>
                              <span>{data.details.enthusiasm}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Consistency</span>
                              <span>{data.details.consistency}/100</span>
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
            </div>
          </Suspense>
        </TabsContent>

        {/* Activity Patterns Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="grid grid-cols-1 gap-6">
              {/* Messages per Hour of Day */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages per Hour of Day</CardTitle>
                  <CardDescription>
                    Find peak chat hours to understand when the conversation is
                    most active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.messagesByHour &&
                  Object.keys(safeStats.messagesByHour).length > 0 ? (
                    <>
                      <div className="h-72">
                        <BarChart
                          data={Object.entries(safeStats.messagesByHour).map(
                            ([hour, count]) => ({
                              name: `${hour}:00`,
                              count: count as number,
                            })
                          )}
                          title="Hourly Message Distribution"
                          height={320}
                          barColor="hsl(var(--chart-1))"
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          * Peak hours reveal when both parties are typically
                          available to chat
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-center p-4">
                      *
                      <h3 className="text-lg font-medium mb-2">
                        No hourly data available
                      </h3>
                      <p className="text-xs text-gray-500">
                        Hourly message distribution data isn&apos;t available in
                        this chat export.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages per Day of Week */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages per Day of Week</CardTitle>
                  <CardDescription>
                    Identify which days of the week you communicate most
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.messagesByDay &&
                  Object.keys(safeStats.messagesByDay).length > 0 ? (
                    <>
                      <div className="h-72">
                        <BarChart
                          data={Object.entries(safeStats.messagesByDay).map(
                            ([day, count]) => ({
                              name: day.substring(0, 3),
                              count: count as number,
                            })
                          )}
                          title="Daily Message Patterns"
                          height={320}
                          barColor="hsl(var(--chart-2))"
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          * Weekend patterns often differ from weekday
                          communication styles
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-center p-4">
                      *
                      <h3 className="text-lg font-medium mb-2">
                        No daily data available
                      </h3>
                      <p className="text-xs text-gray-500">
                        Day of week message distribution data isn&apos;t
                        available in this chat export.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages per Month */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages per Month</CardTitle>
                  <CardDescription>
                    Track conversation trends over time to see how the
                    relationship has evolved
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {safeStats.messagesByMonth &&
                  Object.keys(safeStats.messagesByMonth).length > 0 ? (
                    <>
                      <div className="h-72">
                        <BarChart
                          data={Object.entries(safeStats.messagesByMonth).map(
                            ([month, count]) => ({
                              name: month,
                              count: count as number,
                            })
                          )}
                          title="Monthly Message Trends"
                          height={320}
                          barColor="hsl(var(--chart-3))"
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          * Monthly trends can reveal changes in the
                          relationship dynamics over time
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-center p-4">
                      *
                      <h3 className="text-lg font-medium mb-2">
                        No monthly data available
                      </h3>
                      <p className="text-xs text-gray-500">
                        Monthly message distribution data isn&apos;t available
                        in this chat export.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
