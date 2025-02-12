"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Vérifier que l'utilisateur est un agent
  useEffect(() => {
    if (!loading && (!user || user.role !== "AGENT")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        items={[
          { label: "Dashboard", href: "/agent" },
          { label: "Historique", href: "/agent/history" },
          { label: "Paramètres", href: "/agent/settings" },
        ]}
      />
      <main>{children}</main>
      <Toaster />
    </div>
  );
}
