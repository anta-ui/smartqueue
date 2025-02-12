"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setVerifying(true);
    try {
      await authService.verifyEmail(token);
      toast({
        title: "Email vérifié",
        description: "Votre email a été vérifié avec succès",
      });
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Erreur de vérification",
        description: "Le lien de vérification est invalide ou a expiré",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast({
        title: "Email envoyé",
        description: "Un nouveau lien de vérification vous a été envoyé",
      });
    } catch (err) {
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer l'email de vérification",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Vérification de l'email</h2>
      
      <p className="text-gray-600 mb-6">
        Un email de vérification a été envoyé à votre adresse email.
        Veuillez cliquer sur le lien dans l'email pour vérifier votre compte.
      </p>

      <div className="space-y-4">
        <Button
          onClick={resendVerification}
          disabled={resending}
          variant="outline"
          className="w-full"
        >
          {resending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
        </Button>

        <Button
          onClick={() => router.push("/login")}
          variant="ghost"
          className="w-full"
        >
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
