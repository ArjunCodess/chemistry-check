"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatAnalyzerForm } from "@/components/home/chat-analyzer-form";
import { authClient } from "@/lib/auth-client";
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
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session } = authClient.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAuthenticated = !!session;

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
            {isAuthenticated ? (
              <ChatAnalyzerForm />
            ) : (
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <div className="relative">
                    <div
                      className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                      onClick={() => setIsDialogOpen(true)}
                      aria-label="Sign in to analyze chats"
                    />

                    <div className="opacity-70 pointer-events-none">
                      <ChatAnalyzerForm />
                    </div>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                    <AlertDialogDescription>
                      You need to be signed in to analyze chat conversations.
                      Please sign in or create an account to continue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Link href="/sign-in">Sign In</Link>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
