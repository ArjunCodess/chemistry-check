"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Stepper, Step } from "@/components/ui/stepper";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

// Platform specific instructions
const PLATFORM_INSTRUCTIONS = {
  telegram: [
    {
      label: "Download Desktop App",
      description:
        "Download Telegram on your computer from desktop.telegram.org.",
    },
    {
      label: "Log In",
      description: "Open the app on desktop and log in using your phone.",
    },
    {
      label: "Open Chat",
      description:
        "Go to the chat you intend to analyze and tap on the three dots in the top right corner.",
    },
    {
      label: "Export Chat",
      description: "Click on 'Export Chat History'.",
    },
    {
      label: "Select Options",
      description: "Unselect all boxes, media files are not analyzed.",
    },
    {
      label: "Choose Format",
      description: "IMPORTANT: Change the format to 'Machine-Readable JSON'.",
    },
    {
      label: "Export",
      description: "Go ahead and export.",
    },
    {
      label: "Show Data",
      description: "Click 'Show My Data'.",
    },
    {
      label: "Open File",
      description: "Open the file in the folder.",
    },
    {
      label: "Upload File",
      description: "Upload the file using the choose file option below.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
  instagram: [
    {
      label: "Open Profile",
      description: "Open your profile on Instagram.",
    },
    {
      label: "Access Menu",
      description: "Tap on the three lines in the top right corner.",
    },
    {
      label: "Your Activity",
      description: "Tap 'Your Activity'.",
    },
    {
      label: "Download Information",
      description: "Tap 'Download Your Information'.",
    },
    {
      label: "Select Download",
      description: "Tap 'Download or transfer information'.",
    },
    {
      label: "Choose Data",
      description: "Tap 'Some of your information'.",
    },
    {
      label: "Select Messages",
      description: "Choose 'messages'.",
    },
    {
      label: "Continue",
      description: "Tap 'next'.",
    },
    {
      label: "Choose Device",
      description: "Tap 'download to device'.",
    },
    {
      label: "Set Date Range",
      description: "Tap 'last year' for date range.",
    },
    {
      label: "Select Format",
      description: "Choose 'JSON' for format.",
    },
    {
      label: "Create Files",
      description: "Tap 'create files'.",
    },
    {
      label: "Wait for Email",
      description:
        "Wait for Instagram to email you the download link (10-30 minutes), then click the link or download the file from the 'Download Your Information' page in the app.",
    },
    {
      label: "Download File",
      description: "Download the file.",
    },
    {
      label: "Upload File",
      description: "Upload the file using the choose file option below.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
  whatsapp: [
    {
      label: "Open Conversation",
      description:
        "Open the conversation on WhatsApp that you want to analyze.",
    },
    {
      label: "Access Menu",
      description: "Tap on the three dots in the top right corner.",
    },
    {
      label: "More Options",
      description: "Tap on 'More'.",
    },
    {
      label: "Export Chat",
      description: "Tap on 'Export chat'.",
    },
    {
      label: "Choose Option",
      description: "Choose 'Without media'.",
    },
    {
      label: "Share",
      description: "Share it to yourself.",
    },
    {
      label: "Download Chat",
      description: "Download the chat.",
    },
    {
      label: "Upload File",
      description: "Upload the file using the choose file option below.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<
    "telegram" | "instagram" | "whatsapp" | null
  >(null);
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
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white px-4 sm:p-6 md:p-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 sm:space-y-2 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              TeXtRay
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Upload your chat history to analyze communication patterns and get
              insights
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <label
                  htmlFor="platform"
                  className="block text-xs sm:text-sm font-medium text-gray-700"
                >
                  Select Platform
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center"
                    >
                      {platform
                        ? platform.charAt(0).toUpperCase() + platform.slice(1)
                        : "Select Platform"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuItem onClick={() => setPlatform("telegram")}>
                      Telegram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPlatform("instagram")}>
                      Instagram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPlatform("whatsapp")}>
                      WhatsApp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label
                  htmlFor="file"
                  className="block text-xs sm:text-sm font-medium text-gray-700"
                >
                  Upload Chat File
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4
                    file:rounded-md file:border-0
                    file:text-xs sm:file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!file || !platform || isLoading}
                className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base transition-colors"
              >
                {isLoading ? "Analyzing..." : "Analyze Chat"}
              </Button>
              {platform && (
                <div className="space-y-2 sm:space-y-4 border p-4 pb-1 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700">
                    How to Export Your Chat
                  </h3>
                  <Stepper
                    initialStep={-1} // No active step
                    steps={platformSteps}
                    orientation="vertical"
                    expandVerticalSteps={true}
                  >
                    {platformSteps.map((step, index) => (
                      <Step
                        key={index}
                        label={step.label}
                        description={step.description}
                      >
                        <div className="py-2"></div>
                      </Step>
                    ))}
                  </Stepper>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
