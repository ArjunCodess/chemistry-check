'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze chat');
      }

      const stats = await response.json();
      
      // Store stats in localStorage for the dashboard
      localStorage.setItem('chatStats', JSON.stringify(stats));
      
      toast.success('Chat analysis complete!');
      
      // Add a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to analyze chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white px-4 sm:p-6 md:p-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 sm:space-y-2 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">TeXtRay</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Upload your chat history to analyze communication patterns and get insights
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  accept=".json"
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
              <Button 
                type="submit" 
                disabled={!file || isLoading}
                className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Chat'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}