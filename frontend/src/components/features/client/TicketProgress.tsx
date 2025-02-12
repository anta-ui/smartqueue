"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import type { Ticket } from "@/types/queue";

interface TicketProgressProps {
  ticket: Ticket;
  estimatedCallTime?: Date;
}

export function TicketProgress({ ticket, estimatedCallTime }: TicketProgressProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!estimatedCallTime) return;

      const now = new Date();
      const diff = estimatedCallTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("C'est bientôt votre tour !");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${minutes}:${seconds.toString().padStart(2, "0")} minutes`
      );
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [estimatedCallTime]);

  const steps = [
    {
      icon: CheckCircleIcon,
      title: "Ticket créé",
      description: `#${ticket.number}`,
      status: "complete",
    },
    {
      icon: UserIcon,
      title: "Position",
      description: `${ticket.peopleAhead} personne${
        ticket.peopleAhead > 1 ? "s" : ""
      } avant vous`,
      status: ticket.peopleAhead > 0 ? "current" : "complete",
    },
    {
      icon: ClockIcon,
      title: "Temps d'attente",
      description: timeLeft || `${ticket.estimatedWaitTime} minutes`,
      status: ticket.status === "WAITING" ? "upcoming" : "complete",
    },
    {
      icon: BellIcon,
      title: "Notification",
      description: "Nous vous préviendrons",
      status: "upcoming",
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Ligne de progression */}
      <div className="absolute left-9 top-0 h-full w-0.5 bg-gray-200" />

      {/* Étapes */}
      {steps.map((step, index) => (
        <div key={step.title} className="relative flex items-start">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
              step.status === "complete"
                ? "bg-green-500"
                : step.status === "current"
                ? "bg-blue-500"
                : "bg-gray-300"
            }`}
          >
            <step.icon
              className={`h-5 w-5 ${
                step.status === "complete" || step.status === "current"
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </motion.div>

          <div className="ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">{step.title}</div>
            <AnimatePresence mode="wait">
              <motion.p
                key={step.description}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-sm text-gray-500"
              >
                {step.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
