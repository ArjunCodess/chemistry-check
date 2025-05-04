import { ChatStats } from "@/types";

interface AttachmentStyleCardProps {
  stats: ChatStats;
}

export function AttachmentStyleCard({ stats }: AttachmentStyleCardProps) {
  const attachmentStyles = stats.attachmentStyles || {};
  const users = Object.keys(attachmentStyles);
  
  if (users.length === 0) {
    return null;
  }
  
  const attachmentData = {
    secure: {
      emoji: "🔒",
      title: "Secure",
      description: "Open communication, trust, and emotional support."
    },
    anxious: {
      emoji: "😟",
      title: "Anxious",
      description: "Seeking constant reassurance and worry about rejection."
    },
    avoidant: {
      emoji: "🏃",
      title: "Avoidant",
      description: "Difficulty with emotional intimacy and maintaining distance."
    },
    disorganized: {
      emoji: "🌪️",
      title: "Disorganized",
      description: "Mixed patterns of anxious and avoidant behaviors."
    }
  };

  return (
    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-3xl p-5 shadow-sm h-auto">
      <h3 className="text-lg font-medium text-center text-purple-800 dark:text-purple-200 mb-4">
        Attachment Styles
      </h3>
      
      <div className="space-x-6 grid grid-cols-2 gap-4">
        {users.map((user) => {
          const userData = attachmentStyles[user];
          const primaryStyle = userData?.primaryStyle?.toLowerCase() || 'unknown';
          
          const styleData = attachmentData[primaryStyle as keyof typeof attachmentData] || {
            emoji: "❓",
            title: userData?.primaryStyle || "Unknown",
            description: userData?.description || "Unique relationship dynamic detected."
          };
          
          return (
            <div key={user} className="flex flex-col items-center">
              <span className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                {user}
              </span>
              <span className="text-3xl mb-2">{styleData.emoji}</span>
              <h4 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-1">
                {styleData.title}
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-400 text-center max-w-56">
                {styleData.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}