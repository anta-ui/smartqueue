"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  ShareIcon,
  TrashIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { useQueueHistory } from "@/hooks/queue/useQueueHistory";

export function QueueHistory() {
  const router = useRouter();
  const { history, removeFromHistory, clearHistory } = useQueueHistory();
  const [open, setOpen] = useState(false);

  const handleShare = async (queueId: string, name: string) => {
    try {
      await navigator.share({
        title: "SmartQueue - " + name,
        text: "Rejoignez-moi dans la file d'attente !",
        url: `https://smartqueue.app/q/${queueId}`,
      });
    } catch (error) {
      // L'utilisateur a annulé ou le partage n'est pas supporté
      console.debug("Share failed:", error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Moins d'une minute
    if (diff < 60000) {
      return "À l'instant";
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    
    // Plus d'un jour
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <ClockIcon className="h-5 w-5" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Historique des files</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {history.length > 0 ? (
            <>
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.organization}</p>
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(item.id, item.name)}
                      >
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                      {item.qrCode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/queue/${item.id}`)}
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromHistory(item.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <Button
                  variant="outline"
                  onClick={clearHistory}
                  className="w-full"
                >
                  Effacer l'historique
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun historique</p>
              <p className="text-sm mt-2">
                Les files que vous rejoignez apparaîtront ici
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
