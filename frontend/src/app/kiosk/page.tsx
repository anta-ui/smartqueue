"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCodeIcon,
  TicketIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const MAIN_ACTIONS = [
  {
    id: "new-ticket",
    icon: TicketIcon,
    label: "Prendre un ticket",
    description: "Rejoindre une file d'attente",
    color: "bg-blue-500",
    href: "/ticket/new",
  },
  {
    id: "scan-qr",
    icon: QrCodeIcon,
    label: "Scanner un QR code",
    description: "Utiliser un code existant",
    color: "bg-purple-500",
    href: "/scan",
  },
  {
    id: "appointment",
    icon: CalendarIcon,
    label: "Rendez-vous",
    description: "J'ai un rendez-vous",
    color: "bg-green-500",
    href: "/appointment",
  },
  {
    id: "check-status",
    icon: ArrowPathIcon,
    label: "Vérifier le statut",
    description: "Suivre ma position",
    color: "bg-orange-500",
    href: "/status",
  },
];

export default function KioskHomePage() {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Animation de sélection
  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setTimeout(() => {
      const action = MAIN_ACTIONS.find((a) => a.id === actionId);
      if (action) {
        router.push(action.href);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bienvenue</h1>
        <p className="text-xl text-muted-foreground">
          Sélectionnez une option pour commencer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
        <AnimatePresence>
          {MAIN_ACTIONS.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-8 cursor-pointer transition-shadow hover:shadow-lg ${
                  selectedAction === action.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleActionSelect(action.id)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`${action.color} p-4 rounded-full text-white`}
                  >
                    <action.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-semibold">{action.label}</h2>
                  <p className="text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Options d'accessibilité */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center space-x-4">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full"
          onClick={() => {/* TODO: Activer le mode malvoyant */}}
        >
          <UserIcon className="h-6 w-6 mr-2" />
          Mode accessibilité
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full"
          onClick={() => {/* TODO: Ouvrir l'aide vocale */}}
        >
          <PhoneIcon className="h-6 w-6 mr-2" />
          Aide vocale
        </Button>
      </div>
    </div>
  );
}
