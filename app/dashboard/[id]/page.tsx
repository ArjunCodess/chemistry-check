"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { redirect, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowLeft, Menu, Edit2, Check, X } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";

const TabLoadingFallback = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

export default function AnalysisDashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisDetails, setAnalysisDetails] = useState<{
    name: string;
    createdAt: string;
    platform: string;
  } | null>(null);
  const router = useRouter();
  const params = useParams();
  const analysisId = params.id as string;
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, Record<number, boolean>>
  >({});
  const [activeTab, setActiveTab] = useState("basic");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/sign-in");
    }
  }, [session, isPending]);

  const toggleMessageExpand = useCallback((user: string, index: number) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [user]: {
        ...(prev[user] || {}),
        [index]: !prev[user]?.[index],
      },
    }));
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);

        // Fetch analysis by ID
        const response = await fetch(`/api/analyses/${analysisId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();

        setStats(data.stats);
        setAnalysisDetails({
          name: data.name,
          createdAt: data.createdAt,
          platform: data.platform,
        });
        setEditedName(data.name || "Untitled Analysis");
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Failed to load analysis");
        // Keep user on the page rather than redirecting
      } finally {
        setIsLoading(false);
      }
    };

    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId]);

  const handleUploadNewChat = () => {
    router.push("/");
  };

  // Function to handle name update
  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      setEditedName(analysisDetails?.name || "Untitled Analysis");
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update analysis name");
      }

      // Update the local state with the new name
      setAnalysisDetails((prev) =>
        prev ? { ...prev, name: editedName.trim() } : null
      );
      setIsEditingName(false);
      toast.success("Analysis name updated");
    } catch (error) {
      console.error("Error updating analysis name:", error);
      toast.error("Failed to update analysis name");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl">Analysis not found or no longer available</div>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Upload New Chat
        </Button>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center pb-4 mb-4 md:pb-8 md:mb-8 border-b">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl sm:text-3xl md:text-4xl font-bold border-b-2 border-primary outline-none bg-transparent min-w-[300px] w-fit"
                autoFocus
              />
              <button
                onClick={handleUpdateName}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Save name"
              >
                <Check className="h-5 w-5 text-green-500" />
              </button>
              <button
                onClick={() => {
                  setEditedName(analysisDetails?.name || "Untitled Analysis");
                  setIsEditingName(false);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Cancel editing"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {analysisDetails?.name || "Chat Analytics"}
              </h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Edit analysis name"
              >
                <Edit2 className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
          {analysisDetails?.createdAt && (
            <p className="text-sm text-gray-500 mt-1">
              Analysis from{" "}
              {new Date(analysisDetails.createdAt).toLocaleString()}
            </p>
          )}
          {analysisDetails?.platform && (
            <p className="text-sm text-gray-500">
              Platform:{" "}
              {analysisDetails.platform.charAt(0).toUpperCase() +
                analysisDetails.platform.slice(1)}
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 mb-auto md:space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Analysis</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this analysis and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `/api/analyses/${analysisId}`,
                        {
                          method: "DELETE",
                          credentials: "include",
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to delete analysis");
                      }

                      toast.success("Analysis deleted successfully");
                      router.push("/history");
                    } catch (error) {
                      console.error("Error deleting analysis:", error);
                      toast.error("Failed to delete analysis");
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs
          defaultValue="basic"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 w-full overflow-x-auto">
            <TabsTrigger value="basic">Basic Stats</TabsTrigger>
            <TabsTrigger value="time">Response Times</TabsTrigger>
            <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="emoji">Emoji Analysis</TabsTrigger>
            <TabsTrigger value="phrases">Phrase Analysis</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <div className="px-1 overflow-hidden">
            <TabsContent value="basic" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <BasicStats
                  stats={safeStats}
                  expandedMessages={expandedMessages}
                  toggleMessageExpand={toggleMessageExpand}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="time" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <ResponseTimes stats={safeStats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <ActivityPatterns stats={safeStats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="media" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <Media stats={safeStats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="emoji" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <EmojiAnalysis stats={safeStats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="phrases" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <PhraseAnalysis stats={safeStats} />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 overflow-x-auto">
              <Suspense fallback={<TabLoadingFallback />}>
                <AIInsights
                  stats={safeStats}
                  onUploadNewChat={handleUploadNewChat}
                />
              </Suspense>
            </TabsContent>
          </div>
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

      {/* Mobile Tabs Content */}
      <div className="md:hidden overflow-hidden">
        {activeTab === "basic" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <BasicStats
                stats={safeStats}
                expandedMessages={expandedMessages}
                toggleMessageExpand={toggleMessageExpand}
              />
            </div>
          </Suspense>
        )}
        {activeTab === "time" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <ResponseTimes stats={safeStats} />
            </div>
          </Suspense>
        )}
        {activeTab === "activity" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <ActivityPatterns stats={safeStats} />
            </div>
          </Suspense>
        )}
        {activeTab === "media" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <Media stats={safeStats} />
            </div>
          </Suspense>
        )}
        {activeTab === "emoji" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <EmojiAnalysis stats={safeStats} />
            </div>
          </Suspense>
        )}
        {activeTab === "phrases" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <PhraseAnalysis stats={safeStats} />
            </div>
          </Suspense>
        )}
        {activeTab === "ai" && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="overflow-x-auto">
              <AIInsights
                stats={safeStats}
                onUploadNewChat={handleUploadNewChat}
              />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
