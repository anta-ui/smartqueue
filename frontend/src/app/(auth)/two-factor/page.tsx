"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import QRCode from "qrcode.js";

const setupSchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

const verifySchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

type SetupFormData = z.infer<typeof setupSchema>;
type VerifyFormData = z.infer<typeof verifySchema>;

export default function TwoFactorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [isSetup, setIsSetup] = useState(false);

  const setupForm = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    // Vérifier si 2FA est déjà configuré
    const check2FAStatus = async () => {
      try {
        const status = await authService.check2FAStatus();
        setIsSetup(status.isEnabled);
        if (!status.isEnabled) {
          const setup = await authService.setup2FA();
          setSecret(setup.secret);
          const qr = await QRCode.toDataURL(setup.qrCodeUrl);
          setQrCode(qr);
        }
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier le statut 2FA",
          variant: "destructive",
        });
      }
    };

    check2FAStatus();
  }, [toast]);

  const handleSetup = async (data: SetupFormData) => {
    setLoading(true);
    try {
      await authService.enable2FA(secret, data.code);
      toast({
        title: "2FA activé",
        description: "L'authentification à deux facteurs a été activée avec succès",
      });
      setIsSetup(true);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Code invalide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (data: VerifyFormData) => {
    setLoading(true);
    try {
      await authService.verify2FA(data.code);
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Code invalide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSetup) {
    return (
      <div className="mt-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Configuration 2FA</h2>
          <p className="text-gray-600 mb-6">
            Scannez le QR code avec votre application d'authentification
          </p>
          {qrCode && (
            <div className="flex justify-center mb-6">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Code secret : <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
          </p>
        </div>

        <form onSubmit={setupForm.handleSubmit(handleSetup)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code de vérification
            </label>
            <Input
              id="code"
              {...setupForm.register("code")}
              className={setupForm.formState.errors.code ? "border-red-500" : ""}
              placeholder="000000"
            />
            {setupForm.formState.errors.code && (
              <p className="mt-1 text-sm text-red-500">
                {setupForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Vérification..." : "Activer 2FA"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Code 2FA
          </label>
          <Input
            id="code"
            {...verifyForm.register("code")}
            className={verifyForm.formState.errors.code ? "border-red-500" : ""}
            placeholder="000000"
          />
          {verifyForm.formState.errors.code && (
            <p className="mt-1 text-sm text-red-500">
              {verifyForm.formState.errors.code.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
      </form>
    </div>
  );
}
