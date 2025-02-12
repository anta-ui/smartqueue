import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Notification } from "@/types/notification";
import { Button } from "./button";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRead = () => {
    if (!notification.status.read) {
      onRead(notification.id);
    }
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    handleRead();
  };

  return (
    <div
      className={`p-2 rounded-md transition-colors ${
        notification.status.read ? "bg-white" : "bg-blue-50"
      } hover:bg-gray-50 cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p
            className={`text-sm ${
              isExpanded ? "" : "line-clamp-2"
            } text-gray-600`}
          >
            {notification.content}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(notification.createdAt), "PPp", { locale: fr })}
          </p>
        </div>
      </div>

      {isExpanded && notification.actions && notification.actions.length > 0 && (
        <div className="mt-2 space-x-2">
          {notification.actions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={
                action.style === "primary"
                  ? "default"
                  : action.style === "danger"
                  ? "destructive"
                  : "outline"
              }
              onClick={(e) => {
                e.stopPropagation();
                if (action.url) {
                  window.open(action.url, "_blank");
                }
                // Gérer les autres types d'actions ici
              }}
              disabled={action.completed}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
