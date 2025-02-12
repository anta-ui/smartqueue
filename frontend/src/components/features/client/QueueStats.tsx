"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ChartBarIcon,
  StarIcon as StarIconSolid,
  ClockIcon,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarIconOutline,
} from "@heroicons/react/24/outline";
import { useQueueFavorites } from "@/hooks/queue/useQueueFavorites";
import { useQueueHistory } from "@/hooks/queue/useQueueHistory";

export function QueueStats() {
  const { favorites, getMostVisited } = useQueueFavorites();
  const { history } = useQueueHistory();

  // Calculer les statistiques
  const mostVisited = getMostVisited(3);
  const totalVisits = favorites.reduce((sum, fav) => sum + fav.visitCount, 0);
  const averageWaitTime = history.length > 0
    ? Math.round(history.reduce((sum, item) => sum + (item.waitTime || 0), 0) / history.length)
    : 0;

  // Calculer les heures de pointe
  const peakHours = history.reduce((acc, item) => {
    const hour = new Date(item.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const busyHours = Object.entries(peakHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => ({
      start: parseInt(hour),
      end: (parseInt(hour) + 1) % 24,
    }));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <ChartBarIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Statistiques</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Files visitées</p>
              <p className="text-2xl font-bold text-indigo-600">{history.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Temps moyen</p>
              <p className="text-2xl font-bold text-green-600">
                {averageWaitTime}min
              </p>
            </div>
          </div>

          {/* Files les plus visitées */}
          {mostVisited.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <StarIconSolid className="h-5 w-5 text-yellow-500" />
                Files favorites
              </h3>
              <div className="space-y-3">
                {mostVisited.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{fav.name}</p>
                      <p className="text-sm text-gray-500">{fav.organization}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600">
                        {fav.visitCount} visites
                      </p>
                      <p className="text-xs text-gray-500">
                        Dernière visite:{" "}
                        {new Date(fav.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heures de pointe */}
          {busyHours.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-indigo-500" />
                Heures de pointe
              </h3>
              <div className="space-y-2">
                {busyHours.map(({ start, end }) => (
                  <div
                    key={start}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm">
                      {start.toString().padStart(2, "0")}:00 -{" "}
                      {end.toString().padStart(2, "0")}:00
                    </p>
                    <div className="w-24 h-2 bg-indigo-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${
                            (peakHours[start] / Math.max(...Object.values(peakHours))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
