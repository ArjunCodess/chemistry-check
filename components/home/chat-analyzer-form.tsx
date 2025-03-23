"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlatformSelector } from "./platform-selector";
import { FileUpload } from "./file-upload";
import { ExportInstructions } from "./export-instructions";
import { PLATFORM_INSTRUCTIONS, Platform } from "@/lib/platform-instructions";

export function ChatAnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !platform) {
      toast.error(
        platform ? "Please select a file" : "Please select a platform"
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", platform);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze chat");
      }

      const stats = await response.json();

      // Store stats in localStorage for the dashboard
      localStorage.setItem("chatStats", JSON.stringify(stats));

      toast.success("Chat analysis complete!");

      // Add a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to analyze chat");
    } finally {
      setIsLoading(false);
    }
  };

  const platformSteps = platform ? PLATFORM_INSTRUCTIONS[platform] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <PlatformSelector platform={platform} setPlatform={setPlatform as (p: Platform) => void} />
      <FileUpload handleFileChange={handleFileChange} />
      <Button
        type="submit"
        disabled={!file || !platform || isLoading}
        className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base transition-colors"
      >
        {isLoading ? "Analyzing..." : "Analyze Chat"}
      </Button>
      {platform && <ExportInstructions steps={platformSteps} />}
    </form>
  );
} 