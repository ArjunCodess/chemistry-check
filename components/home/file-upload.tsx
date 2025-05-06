"use client";

import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FileUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ handleFileChange }: FileUploadProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <Label htmlFor="file">Upload Chat File</Label>
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