import { ChatStats } from "@/types";

interface TopWordsCardProps {
  stats: ChatStats;
}

export function TopWordsCard({ stats }: TopWordsCardProps) {
  const wordFrequency = stats.wordFrequency || {};
  
  const wordsArray = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  
  const firstColumn = wordsArray.slice(0, 4);
  const secondColumn = wordsArray.slice(4, 8);
  const thirdColumn = wordsArray.slice(8, 12);
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-blue-800 dark:text-blue-200 mb-4">
        Top words
      </h3>
      
      <div className="flex justify-between">
        <div className="flex-1">
          {firstColumn.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-blue-700 dark:text-blue-300 font-medium">{item.word}</span>
              <span className="text-blue-600 dark:text-blue-400">{item.count}</span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 mx-4">
          {secondColumn.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-blue-700 dark:text-blue-300 font-medium">{item.word}</span>
              <span className="text-blue-600 dark:text-blue-400">{item.count}</span>
            </div>
          ))}
        </div>
        
        <div className="flex-1">
          {thirdColumn.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-blue-700 dark:text-blue-300 font-medium">{item.word}</span>
              <span className="text-blue-600 dark:text-blue-400">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}