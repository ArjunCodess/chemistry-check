"use client";

import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Link from "next/link";

interface FileUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ handleFileChange }: FileUploadProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="file">Upload Chat File</Label>
        <Link
          href="/help"
          className="text-xs md:text-sm text-primary underline-offset-2 underline"
        >
          How do I get my chat file?
        </Link>
      </div>
      <Input
        type="file"
        id="file"
        accept=".json, .txt"
        onChange={handleFileChange}
        required
      />
    </div>
  );
}