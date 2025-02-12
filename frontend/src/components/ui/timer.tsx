"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  startTime: Date;
  className?: string;
}

export function Timer({ startTime, className }: TimerProps) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    // Mettre à jour immédiatement
    updateElapsed();

    // Mettre à jour toutes les secondes
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return <span className={className}>{elapsed}</span>;
}
