"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeftIcon,
  PrinterIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

export default function ConfirmTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const [contact, setContact] = useState({
    email: "",
    phone: "",
  });
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Appeler l'API pour créer le ticket
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          contact,
          notifications,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const ticket = await response.json();

      // Simuler l'impression
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Rediriger vers la page de succès
      router.push(`/ticket/success?id=${ticket.id}`);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      // TODO: Afficher une erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
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
        <h1 className="text-4xl font-bold mb-4">Confirmer votre ticket</h1>
        <p className="text-xl text-muted-foreground">
          Choisissez comment recevoir votre ticket
        </p>
      </div>

      {/* Options de notification */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Notifications (optionnel)
        </h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notif"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    email: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="email-notif" className="text-lg">
                Recevoir par email
              </Label>
            </div>
            {notifications.email && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-notif"
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    sms: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="sms-notif" className="text-lg">
                Recevoir par SMS
              </Label>
            </div>
            {notifications.sms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Input
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </motion.div>
            )}
          </div>
        </div>
      </Card>

      {/* Boutons d'action */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          variant="outline"
          className="w-full text-lg h-auto py-8"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <PrinterIcon className="h-8 w-8 mb-2" />
          <span className="block">Imprimer le ticket</span>
        </Button>
        <Button
          size="lg"
          className="w-full text-lg h-auto py-8"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <QrCodeIcon className="h-8 w-8 mb-2" />
          <span className="block">QR Code</span>
        </Button>
      </div>

      {/* Message d'aide */}
      <div className="mt-8 text-center text-muted-foreground">
        <p>
          Vous recevrez des notifications sur l'avancement de votre position
          dans la file d'attente
        </p>
      </div>
    </div>
  );
}
