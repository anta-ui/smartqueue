"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EllipsisHorizontalIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WidgetConfig } from "@/types/dashboard";

interface WidgetProps {
  config: WidgetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  onResize?: (size: WidgetConfig["size"]) => void;
  className?: string;
}

export function Widget({
  config,
  onEdit,
  onDelete,
  onResize,
  className = "",
}: WidgetProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-2",
    large: "col-span-3",
  };

  return (
    <Card
      className={`${className} ${
        isFullscreen ? "fixed inset-0 z-50" : sizeClasses[config.size]
      } overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{config.title}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <ArrowsPointingOutIcon className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  Modifier le widget
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize?.("small")}
                  disabled={config.size === "small"}
                >
                  Petite taille
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize?.("medium")}
                  disabled={config.size === "medium"}
                >
                  Taille moyenne
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize?.("large")}
                  disabled={config.size === "large"}
                >
                  Grande taille
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={`${
            isFullscreen ? "h-[calc(100vh-10rem)]" : "h-[300px]"
          } relative`}
        >
          {/* Le contenu du widget sera injecté ici */}
        </div>
      </div>
    </Card>
  );
}
