"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  ArrowTrendingUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useQueueSuggestions } from "@/hooks/queue/useQueueSuggestions";

export function QueueSuggestions() {
  const router = useRouter();
  const { suggestions } = useQueueSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Files suggérées pour vous
      </h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.queue.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/queue/${suggestion.queue.id}`)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {suggestion.queue.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {suggestion.queue.organization.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {suggestion.score > 1.5 && (
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                )}
                {suggestion.score > 1 && (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>{suggestion.reason}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
