"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/common/NotificationBell";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Vérifier si l'appareil est mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      router.push("/desktop-redirect");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/logo.svg" alt="SmartQueue" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SmartQueue. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
