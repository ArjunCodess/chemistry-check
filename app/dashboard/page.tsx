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
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { BasicStats } from "@/components/dashboard/basic-stats";
import { ResponseTimes } from "@/components/dashboard/response-times";
import { ActivityPatterns } from "@/components/dashboard/activity-patterns";
import { createSafeStats } from "@/lib/chat-stats";
import dynamic from "next/dynamic";
import { ChatStats } from "@/types";
import { Media } from "@/components/dashboard/media";
import { EmojiAnalysis } from "@/components/dashboard/emoji-analysis";

const WordCloud = dynamic(() => import("@/components/charts/word-cloud"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  ),
});

const TabLoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);
  const router = useRouter();
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, Record<number, boolean>>
  >({});
  const [activeTab, setActiveTab] = useState("basic");
  const [drawerOpen, setDrawerOpen] = useState(false);

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

      const parsedData = JSON.parse(savedData);

      const parsedStats = parsedData.stats ? parsedData.stats : parsedData;
      const timestamp = parsedData.timestamp || null;

      console.log("Loaded stats from localStorage:", {
        totalMessages: parsedStats.totalMessages,
        totalWords: parsedStats.totalWords,
        cachedAt: timestamp,
      });

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

  if (stats.messagesByUser && stats.messagesByUser.unknown) {
    delete stats.messagesByUser.unknown;
    stats.totalMessages = Object.values(stats.messagesByUser).reduce(
      (sum, count) => sum + (count as number),
      0
    );
  }

  const safeStats = createSafeStats(stats);

  console.log("Stats loaded successfully:", {
    totalMessages: safeStats.totalMessages,
    totalWords: safeStats.totalWords,
    editedMessages: safeStats.editedMessages?.total,
    avgWordsPerMessage:
      safeStats.totalMessages > 0
        ? safeStats.totalWords / safeStats.totalMessages
        : 0,
  });

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
          <BasicStats
            stats={safeStats}
            expandedMessages={expandedMessages}
            toggleMessageExpand={toggleMessageExpand}
          />
        </TabsContent>

        {/* Response Times Tab */}
        <TabsContent value="time" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <ResponseTimes stats={safeStats} />
          </Suspense>
        </TabsContent>

        {/* Activity Patterns Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <ActivityPatterns stats={safeStats} />
          </Suspense>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <Media stats={safeStats} />
          </Suspense>
        </TabsContent>

        {/* Emoji Analysis Tab */}
        <TabsContent value="emoji" className="space-y-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <EmojiAnalysis stats={safeStats} />
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
      </Tabs>
    </div>
  );
}