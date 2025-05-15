"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Link from "next/link";
import { upload } from '@vercel/blob/client';
import { toast } from "sonner";
import { Progress } from "../ui/progress";

interface FileUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlobUploaded?: (blobUrl: string) => void;
}

export function FileUpload({ handleFileChange, onBlobUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 4 * 1024 * 1024) {
        try {
          setIsUploading(true);
          setUploadProgress(0);
          toast.info("Large file detected. Uploading via secure channel...");
          
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round(progressEvent.percentage);
              setUploadProgress(percentage);
              
              if (percentage === 100) {
                toast.info("Processing upload...");
              }
            },
          });
          
          if (onBlobUploaded) {
            onBlobUploaded(newBlob.url);
          }
          
          toast.success("File uploaded successfully!");
        } catch (error) {
          console.error("Error uploading to Blob:", error);
          toast.error("Failed to upload large file");
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      } else {
        handleFileChange(e);
      }
    }
  };

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
        onChange={handleChange}
        required
        disabled={isUploading}
      />
      {isUploading && (
        <div className="space-y-2 mt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
            <span>Uploading large file... {uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}