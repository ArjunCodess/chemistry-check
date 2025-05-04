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
import Image from "next/image";

export default function Home() {
  const { data: session } = authClient.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAuthenticated = !!session;

  return (
    <main className="min-h-[calc(100vh-70px)] bg-gradient-to-b from-neutral-100 to-white px-4 sm:p-6 md:p-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-neutral-200 shadow-sm">
          <CardHeader className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex-1 pr-8">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
                ChemistryCheck
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Upload your chat history to analyze communication patterns and
                get insights
              </CardDescription>
            </div>
            <div className="flex items-center justify-end my-auto">
              <Image
                src="/logo.png"
                alt="ChemistryCheck"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
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
