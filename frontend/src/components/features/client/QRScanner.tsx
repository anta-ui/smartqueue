"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScanSuccess: (qrCodeMessage: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [scannerInitialized, setScannerInitialized] = useState(false);

  useEffect(() => {
    // Configuration du scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const scanner = new Html5QrcodeScanner("qr-reader", config, false);

    scanner.render(
      (decodedText) => {
        // Succès du scan
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Gestion silencieuse des erreurs de scan
        console.debug("QR scan error:", error);
      }
    );

    setScannerInitialized(true);

    // Nettoyage
    return () => {
      if (scannerInitialized) {
        scanner.clear();
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-black/50">
        <h2 className="text-white text-lg font-medium">Scanner un QR Code</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:text-gray-300"
        >
          <XMarkIcon className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          id="qr-reader"
          className="w-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden"
        />
        <p className="mt-4 text-white text-center text-sm">
          Placez le QR code dans le cadre pour le scanner automatiquement
        </p>
      </div>
    </div>
  );
}
