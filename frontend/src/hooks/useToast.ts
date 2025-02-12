import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const showToast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
    toast({
      title,
      description,
      variant,
      duration,
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({
      title: title || 'Succès',
      description: message,
      variant: 'default',
    });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({
      title: title || 'Erreur',
      description: message,
      variant: 'destructive',
    });
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
  };
}
