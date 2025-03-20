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
      
      toast.success('Chat analysis complete!', {
        description: 'Redirecting to dashboard...',
        duration: 3000,
        className: 'bg-white text-black',
        descriptionClassName: 'text-black',
      });
      
      // Add a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to analyze chat', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 4000,
        className: 'bg-white text-black',
        descriptionClassName: 'text-black',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">TeXtRay</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Upload your chat history to analyze communication patterns and get insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="file" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Chat File
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={!file || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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