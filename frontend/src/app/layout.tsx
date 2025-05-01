"use client"

import "./globals.css"
import { Inter as FontSans } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";
import { useEffect } from 'react';
import { authService } from '@/services/authService';
import Providers from '@/providers/Providers';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialiser les interceptors au montage du composant
    authService.setupInterceptors();
  }, []);
  return (
    <html lang="en">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}