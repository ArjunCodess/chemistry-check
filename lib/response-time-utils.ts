import { ResponseTimeStats } from "@/types";

/**
 * Calculate the percentage of responses in a specific category
 */
export function calculateResponsePercentage(
  distribution: ResponseTimeStats["distribution"],
  category: keyof ResponseTimeStats["distribution"]
): number {
  const totalResponses = Object.values(distribution).reduce(
    (sum, val) => sum + (val as number),
    0
  );

  return totalResponses > 0
    ? Math.round(((distribution[category] || 0) / totalResponses) * 100)
    : 0;
}

/**
 * Get the total number of responses from the distribution
 */
export function getTotalResponses(
  distribution: ResponseTimeStats["distribution"]
): number {
  return Object.values(distribution).reduce(
    (sum, val) => sum + (val as number),
    0
  );
}

/**
 * Get formatted response time categories with their details
 */
export function getResponseTimeCategories() {
  return [
    {
      name: "Quick",
      range: "0-5 min",
      description: "Immediate responses",
      key: "0-5min" as const,
      bgColor: "bg-primary/5",
      borderColor: "border-primary/10",
      barColor: "bg-primary",
    },
    {
      name: "Normal",
      range: "5-15 min",
      description: "Regular conversation",
      key: "5-15min" as const,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      barColor: "bg-blue-400",
    },
    {
      name: "Slow",
      range: "15-30 min",
      description: "Delayed responses",
      key: "15-30min" as const,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      barColor: "bg-amber-400",
    },
    {
      name: "Very Slow",
      range: "30-60 min",
      description: "Significant delays",
      key: "30min-1hour" as const,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      barColor: "bg-orange-400",
    },
    {
      name: "Ghosting",
      range: "60+ min",
      description: "Extended silence",
      key: "1hour+" as const,
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      barColor: "bg-red-400",
    },
  ];
} 