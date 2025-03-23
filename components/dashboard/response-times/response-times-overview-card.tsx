import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ResponseTimeCategory } from "./response-time-category";
import { getResponseTimeCategories } from "@/lib/response-time-utils";

export function ResponseTimesOverviewCard() {
  const categories = getResponseTimeCategories();

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Response Time Overview
        </CardTitle>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Response times show how quickly users reply to each other&apos;s
          messages. Faster response times typically indicate more engaged
          conversations.
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((category) => (
            <ResponseTimeCategory
              key={category.key}
              name={category.name}
              range={category.range}
              description={category.description}
              bgColor={category.bgColor}
              borderColor={category.borderColor}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 