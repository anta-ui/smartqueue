"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useIdleTimer } from "react-idle-timer";
import { Button } from "@/components/ui/button";
import {
  SunIcon,
  MoonIcon,
  LanguageIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const IDLE_TIMEOUT = 120000; // 2 minutes

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Gérer le mode veille après inactivité
  const onIdle = () => {
    // Retourner à l'accueil
    window.location.href = "/";
  };

  useIdleTimer({
    onIdle,
    timeout: IDLE_TIMEOUT,
    throttle: 500,
  });

  // Éviter l'hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Barre de contrôle flottante */}
      <div
        className={`fixed top-4 right-4 flex items-center gap-2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {/* TODO: Ouvrir le sélecteur de langue */}}
          className="rounded-full"
        >
          <LanguageIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.href = "/"}
          className="rounded-full"
        >
          <HomeIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Contenu principal */}
      <main 
        className="min-h-screen p-8"
        onMouseMove={() => setShowControls(true)}
        onClick={() => setShowControls(true)}
      >
        {children}
      </main>

      {/* Pied de page avec informations système */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <p>SmartQueue Kiosk v1.0</p>
          </div>
          <div className="flex items-center gap-4">
            <p>{new Date().toLocaleTimeString()}</p>
            <p>ID: KIOSK-{process.env.NEXT_PUBLIC_KIOSK_ID || "DEV"}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
