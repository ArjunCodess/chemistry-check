"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatAnalyzerForm } from "@/components/home/chat-analyzer-form";

export default function Home() {
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
            <ChatAnalyzerForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}