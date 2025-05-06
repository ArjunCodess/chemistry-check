"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlatformSelector } from "./platform-selector";
import { FileUpload } from "./file-upload";
import { ExportInstructions } from "./export-instructions";
import { PLATFORM_INSTRUCTIONS, Platform } from "@/lib/platform-instructions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ChatAnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [name, setName] = useState("");
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !platform) {
      toast.error(
        platform ? "Please select a file" : "Please select a platform"
      );
      return;
    }

    if (!session?.user) {
      toast.error("You must be signed in to analyze chats");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", platform);
      formData.append("name", name || "Untitled Analysis");
      
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Analysis in progress. Are you sure you want to leave?";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.error || data.details || "Failed to analyze chat");
      }

      // Store stats in localStorage for the dashboard
      localStorage.setItem("chatStats", JSON.stringify({
        stats: data,
        timestamp: new Date().toISOString(),
      }));

      toast.success("Chat analysis complete!");

      // Remove beforeunload event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Add a small delay before redirecting to show the toast
      setTimeout(() => {
        if (data.analysisId) {
          router.push(`/dashboard/${data.analysisId}`);
        } else {
          router.push("/dashboard");
        }
      }, 500);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze chat");
    } finally {
      setIsLoading(false);
    }
  };

  const platformSteps = platform ? PLATFORM_INSTRUCTIONS[platform] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="analysis-name">Analysis Name (optional)</Label>
        <Input
          id="analysis-name"
          type="text"
          placeholder="E.g., 'Conversation with Alex' or 'Group Chat Analysis'"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <PlatformSelector platform={platform} setPlatform={setPlatform as (p: Platform) => void} />
      <FileUpload handleFileChange={handleFileChange} />
      <Button
        type="submit"
        disabled={!file || !platform || isLoading || !session}
        className="w-full py-2 sm:py-3 text-sm sm:text-base transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Analyzing... Please don&apos;t close this tab</span>
          </div>
        ) : (
          "Analyze Chat"
        )}
      </Button>
      {!session && (
        <p className="text-sm text-red-500">You must be signed in to analyze chats</p>
      )}
      {platform && <ExportInstructions steps={platformSteps} />}
    </form>
  );
} 