"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            TeXtRay
          </Link>
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          TeXtRay
        </Link>

        {isPending ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                  <AvatarFallback className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-800">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <hr className="my-1" />
              <DropdownMenuItem
                onClick={() => authClient.signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}