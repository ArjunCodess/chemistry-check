import { ChatStats, MediaStats } from "@/types";

/**
 * Get the top media contributor from the chat stats
 */
export function getTopMediaContributor(stats: ChatStats): { user: string; count: number } | null {
  if (!stats.mediaStats?.byUser) return null;
  
  const users = Object.entries(stats.mediaStats.byUser);
  if (users.length === 0) return null;
  
  // Sort by total media count in descending order
  users.sort(([, a], [, b]) => b.total - a.total);
  
  // Return the top contributor
  const [user, data] = users[0];
  return { user, count: data.total };
}

/**
 * Calculate the percentage of each media type in the overall media count
 */
export function getMediaTypePercentages(stats: ChatStats): Record<string, number> {
  if (!stats.mediaStats?.byType || stats.mediaStats.total === 0) {
    return {};
  }
  
  const total = stats.mediaStats.total;
  const { 
    images, 
    videos, 
    documents, 
    stickers, 
    animations, 
    links,
    reels,
    stories,
    posts
  } = stats.mediaStats.byType;
  
  const percentages: Record<string, number> = {
    images: Math.round((images / total) * 100),
    videos: Math.round((videos / total) * 100),
    documents: Math.round((documents / total) * 100),
    stickers: Math.round((stickers / total) * 100),
    animations: Math.round((animations / total) * 100),
    links: Math.round((links / total) * 100)
  };
  
  // Add Instagram-specific media types if they exist
  if (reels) percentages.reels = Math.round((reels / total) * 100);
  if (stories) percentages.stories = Math.round((stories / total) * 100);
  if (posts) percentages.posts = Math.round((posts / total) * 100);
  
  return percentages;
}

/**
 * Get media stats for a specific user
 */
export function getUserMediaStats(stats: ChatStats, username: string): MediaStats["byUser"][string] | null {
  if (!stats.mediaStats?.byUser || !stats.mediaStats.byUser[username]) {
    return null;
  }
  
  return stats.mediaStats.byUser[username];
} 