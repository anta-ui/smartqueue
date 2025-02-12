"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  estimatedTime: number;
  currentWait: number;
  peopleWaiting: number;
}

const MOCK_SERVICES: Service[] = [
  {
    id: "general",
    name: "Service Général",
    description: "Informations et assistance générale",
    icon: DocumentTextIcon,
    estimatedTime: 10,
    currentWait: 15,
    peopleWaiting: 5,
  },
  {
    id: "account",
    name: "Gestion de Compte",
    description: "Création, modification de compte",
    icon: UserGroupIcon,
    estimatedTime: 15,
    currentWait: 25,
    peopleWaiting: 8,
  },
  // Ajouter plus de services ici
];

export default function NewTicketPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    // Rediriger vers la confirmation après un court délai
    setTimeout(() => {
      router.push(`/ticket/confirm?service=${serviceId}`);
    }, 500);
  };

  return (
    <div className="container mx-auto max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeftIcon className="h-6 w-6 mr-2" />
          Retour
        </Button>
        <h1 className="text-4xl font-bold mb-4">Choisir un service</h1>
        <p className="text-xl text-muted-foreground">
          Sélectionnez le service dont vous avez besoin
        </p>
      </div>

      {/* Liste des services */}
      <div className="grid gap-6">
        {MOCK_SERVICES.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all ${
                selectedService === service.id
                  ? "ring-2 ring-primary"
                  : "hover:shadow-lg"
              }`}
              onClick={() => handleServiceSelect(service.id)}
            >
              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  <service.icon className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">
                    {service.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        <span>Attente</span>
                      </div>
                      <p className="text-2xl font-semibold">
                        {service.currentWait}min
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <UserGroupIcon className="h-5 w-5 mr-1" />
                        <span>En file</span>
                      </div>
                      <p className="text-2xl font-semibold">
                        {service.peopleWaiting}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Message d'aide */}
      <div className="mt-8 text-center text-muted-foreground">
        <p>Besoin d'aide pour choisir ?</p>
        <Button variant="link" size="lg">
          Contactez un agent
        </Button>
      </div>
    </div>
  );
}
