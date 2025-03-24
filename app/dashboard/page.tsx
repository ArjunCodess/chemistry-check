"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { createSafeStats } from "@/lib/chat-stats";
import { ChatStats } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { BasicStats } from "@/components/dashboard/basic-stats";
import { ResponseTimes } from "@/components/dashboard/response-times";
import { ActivityPatterns } from "@/components/dashboard/activity-patterns";
import { Media } from "@/components/dashboard/media";
import { EmojiAnalysis } from "@/components/dashboard/emoji-analysis";
import { PhraseAnalysis } from "@/components/dashboard/phrase-analysis";
import { AIInsights } from "@/components/dashboard/ai-insights";

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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Upload New Chat</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upload New Chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This will take you to the upload page. Your current analysis will be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUploadNewChat}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            <PhraseAnalysis stats={safeStats} />
          </Suspense>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <AIInsights stats={safeStats} onUploadNewChat={handleUploadNewChat} />
        </TabsContent>
      </Tabs>
    </div>
  );
}