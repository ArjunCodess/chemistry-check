'use client';

import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface WordCloudProps {
  data: Array<{ text: string; value: number }>;
  title: string;
  height?: number;
}

export default function WordCloud({ data, title, height = 400 }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && data.length > 0 && containerRef.current) {
      // This would normally be where we'd initialize a word cloud library
      // Since we don't have an actual word cloud library loaded, 
      // we'll create a simulated word cloud using CSS
      
      const container = containerRef.current;
      container.innerHTML = '';
      
      // Find the max value for scaling
      const maxValue = Math.max(...data.map(item => item.value));
      
      // Create word elements
      data.forEach(item => {
        const wordEl = document.createElement('span');
        const size = Math.max(0.8, Math.min(3, (item.value / maxValue) * 3)); // Scale between 0.8-3em
        
        wordEl.textContent = item.text;
        wordEl.style.fontSize = `${size}em`;
        wordEl.style.padding = '0.4em';
        wordEl.style.margin = '0.2em';
        wordEl.style.display = 'inline-block';
        wordEl.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        
        container.appendChild(wordEl);
      });
    }
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef} 
          className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-center"
          style={{ 
            minHeight: typeof height === 'number' ? Math.min(300, height) : height, 
            maxHeight: height,
            overflow: 'hidden' 
          }}
        >
          {/* Word cloud elements will be inserted here by useEffect */}
          {!data.length && (
            <p className="text-muted-foreground">No data available for word cloud</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 