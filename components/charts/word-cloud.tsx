'use client';

import { useTheme } from "next-themes";
import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Import the component dynamically with SSR disabled
const D3WordCloud = dynamic(
  () => import('react-d3-cloud').then(mod => mod.default),
  { ssr: false }
);

interface WordCloudProps {
  data: Array<{ text: string; value: number }>;
  title: string;
  height?: number;
}

// Filters out subset phrases with identical counts
function filterSubsetPhrases(data: Array<{ text: string; value: number }>): Array<{ text: string; value: number }> {
  // Group phrases by count
  const phrasesByCount: Record<number, Array<{ text: string; value: number }>> = {};
  
  // Group all phrases by their count
  data.forEach(item => {
    if (!phrasesByCount[item.value]) {
      phrasesByCount[item.value] = [];
    }
    phrasesByCount[item.value].push(item);
  });
  
  const result: Array<{ text: string; value: number }> = [];
  
  // Process each count group
  Object.values(phrasesByCount).forEach(phrasesWithCount => {
    // If only one phrase has this count, add it directly
    if (phrasesWithCount.length === 1) {
      result.push(phrasesWithCount[0]);
      return;
    }
    
    // Sort phrases by length (longest first)
    const sortedPhrases = [...phrasesWithCount].sort((a, b) => b.text.length - a.text.length);
    
    // Track which phrases to include
    const includePhrases = new Set(sortedPhrases);
    
    // Check for subset relationships
    for (let i = 0; i < sortedPhrases.length; i++) {
      const phrase = sortedPhrases[i];
      if (!includePhrases.has(phrase)) continue;
      
      for (let j = i + 1; j < sortedPhrases.length; j++) {
        const potentialSubset = sortedPhrases[j];
        
        // Skip if already marked for exclusion
        if (!includePhrases.has(potentialSubset)) continue;
        
        // If the longer phrase includes the shorter phrase, mark the shorter phrase for exclusion
        if (phrase.text.includes(potentialSubset.text)) {
          includePhrases.delete(potentialSubset);
        }
      }
    }
    
    // Add all included phrases to the result
    includePhrases.forEach(phrase => {
      result.push(phrase);
    });
  });
  
  return result;
}

export default function WordCloud({ data, title, height = 400 }: WordCloudProps) {
  const { theme, systemTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [isClient, setIsClient] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Filter data to remove duplicate phrases with similar text
  const filteredData = useMemo(() => {
    try {
      // Create safe data with proper validation
      const safeData = data
        .filter(item => item.text && typeof item.text === 'string' && item.value > 0)
        .map(item => ({ 
          text: String(item.text).trim(), 
          value: Math.max(1, Number(item.value))
        }));
      
      // Apply subset filtering to remove redundant phrases
      return filterSubsetPhrases(safeData);
    } catch (err) {
      console.error('Error processing word cloud data:', err);
      setErrorMsg('Error processing data');
      return [];
    }
  }, [data]);
  
  // Safe fontSize function that handles edge cases properly
  const fontSize = useMemo(() => {
    return (word: { value: number }) => {
      // Prevent NaN or negative values inside log calculations
      const value = Math.max(1, word.value);
      return Math.max(12, Math.log2(value) * (typeof window !== 'undefined' && window.innerWidth > 768 ? 6 : 4));
    };
  }, []);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
    console.log('WordCloud mounted on client, data length:', filteredData.length);
  }, [filteredData.length]);

  // Calculate container dimensions on mount and window resize
  useEffect(() => {
    if (!isClient) return;

    function updateDimensions() {
      try {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          const newWidth = Math.max(width - 40, 300);
          const newHeight = typeof height === 'number' ? height : 400;
          
          setDimensions({
            width: newWidth,
            height: newHeight
          });
          
          // Mark data as ready when we have valid dimensions
          if (newWidth > 0 && filteredData.length > 0) {
            setIsDataReady(true);
            setErrorMsg(null);
          }
        }
      } catch (err) {
        console.error('Error calculating dimensions:', err);
        setErrorMsg('Error calculating dimensions');
      }
    }
    
    // Initial calculation
    updateDimensions();
    
    // Force a recalculation after a small delay to ensure the container is properly rendered
    const timer = setTimeout(updateDimensions, 100);
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [height, isClient, filteredData.length]);

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  // Debug logs
  useEffect(() => {
    if (isClient) {
      console.log('WordCloud render state:', {
        isClient,
        isDataReady,
        dimensions,
        originalDataLength: data.length,
        filteredDataLength: filteredData.length,
        theme: currentTheme,
        error: errorMsg
      });
    }
  }, [isClient, isDataReady, dimensions, data.length, filteredData.length, currentTheme, errorMsg]);
  
  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="flex justify-center items-center overflow-hidden relative"
          style={{ 
            minHeight: 300,
            height: height
          }}
        >
          {errorMsg && (
            <p className="text-red-500 absolute">{errorMsg}</p>
          )}
          
          {isClient && isDataReady && filteredData.length > 0 && dimensions.width > 0 ? (
            <div className="w-full h-full">
              <D3WordCloud
                data={filteredData}
                width={dimensions.width}
                height={dimensions.height}
                font="Inter"
                fontSize={fontSize}
                rotate={0}
                padding={5}
                fill={currentTheme === "dark" ? "white" : "black"}
                random={() => 0.5}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">
              {!isClient ? "Loading word cloud..." : 
               filteredData.length === 0 ? "No data available for word cloud" : 
               "Preparing word cloud..."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 