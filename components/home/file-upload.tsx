"use client";

import React from "react";

interface FileUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ handleFileChange }: FileUploadProps) {
  return (
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
        accept=".json, .txt"
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
  );
} 