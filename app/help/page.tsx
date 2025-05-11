"use client";

import { useState } from "react";
import { PlatformSelector } from "@/components/shared/platform-selector";
import { ExportInstructions } from "@/components/help/export-instructions";
import {
  PLATFORM_INSTRUCTIONS,
  PLATFORM_VIDEO_TUTORIALS,
  PLATFORM_NOTES,
  Platform,
} from "@/lib/platform-instructions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HelpPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    "telegram"
  );

  return (
    <Card className="max-w-5xl mx-auto sm:my-8 rounded-none border-none sm:border sm:rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-center">
          How to Export Your Chat History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PlatformSelector
            platform={selectedPlatform}
            setPlatform={(platform) => setSelectedPlatform(platform)}
          />

          {selectedPlatform && (
            <div
              className={`grid grid-cols-1 ${
                selectedPlatform !== "telegram" ? "md:grid-cols-2" : ""
              } gap-4`}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden aspect-auto">
                    <video
                      src={PLATFORM_VIDEO_TUTORIALS[selectedPlatform]}
                      controls
                      className="w-full h-full object-cover"
                      poster="/video-placeholder.png"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <CardDescription className="mt-4">
                    This video demonstrates how to export your chat history from{" "}
                    {selectedPlatform.charAt(0).toUpperCase() +
                      selectedPlatform.slice(1)}
                    .
                  </CardDescription>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <div className="text-sm text-amber-800 border-amber-200 border bg-amber-50 p-4 rounded-lg">
                  <span className="font-medium">Note: </span>
                  {PLATFORM_NOTES[selectedPlatform]}
                </div>

                <div className="relative">
                  <ExportInstructions
                    steps={PLATFORM_INSTRUCTIONS[selectedPlatform]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}