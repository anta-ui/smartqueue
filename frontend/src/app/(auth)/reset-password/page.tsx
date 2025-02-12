"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";

// Schéma pour la demande de réinitialisation
const requestResetSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Schéma pour la réinitialisation du mot de passe
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  const requestResetForm = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleRequestReset = async (data: RequestResetFormData) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation vous a été envoyé",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
      });
      router.push("/login");
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Le lien de réinitialisation est invalide ou a expiré",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Afficher le formulaire approprié en fonction de la présence du token
  return (
    <div className="mt-8">
      {!token ? (
        <form onSubmit={requestResetForm.handleSubmit(handleRequestReset)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <Input
              id="email"
              type="email"
              {...requestResetForm.register("email")}
              className={requestResetForm.formState.errors.email ? "border-red-500" : ""}
            />
            {requestResetForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {requestResetForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <Input
              id="password"
              type="password"
              {...resetPasswordForm.register("password")}
              className={resetPasswordForm.formState.errors.password ? "border-red-500" : ""}
            />
            {resetPasswordForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {resetPasswordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...resetPasswordForm.register("confirmPassword")}
              className={resetPasswordForm.formState.errors.confirmPassword ? "border-red-500" : ""}
            />
            {resetPasswordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {resetPasswordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Réinitialisation en cours..." : "Confirmer la réinitialisation"}
          </Button>
        </form>
      )}
    </div>
  );
}
