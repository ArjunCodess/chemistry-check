"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Platform } from "../../lib/platform-instructions";
import { Label } from "../ui/label";

interface PlatformSelectorProps {
  platform: Platform | null;
  setPlatform: (platform: Platform) => void;
}

export function PlatformSelector({
  platform,
  setPlatform,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label htmlFor="platform">Select Platform</Label>
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
  );
}