// src/components/ui/Modal.tsx
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  className 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay sombre */}
      <div 
        className="fixed inset-0 z-40 bg-black opacity-25" 
        onClick={onClose}
      ></div>

      {/* Contenu du modal */}
      <div 
        className={cn(
          "relative z-50 w-auto max-w-3xl mx-auto my-6",
          "transform transition-all duration-300 ease-out",
          "scale-100 opacity-100",
          className
        )}
      >
        <div 
          className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none"
        >
          {/* Bouton de fermeture */}
          <div className="flex items-start justify-end p-2">
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-50 focus:outline-none"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl text-black opacity-50">
                ×
              </span>
            </button>
          </div>

          {/* Contenu principal */}
          <div className="relative flex-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}