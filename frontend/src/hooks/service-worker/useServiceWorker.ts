import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          setRegistration(registration);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  // Vous pouvez afficher une notification à l'utilisateur
                }
              });
            }
          });
        })
        .catch(err => {
          setError('Failed to register service worker');
          console.error('ServiceWorker registration failed:', err);
        });

      // Gérer les mises à jour
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // La page sera rechargée lorsque le nouveau service worker prendra le contrôle
        window.location.reload();
      });
    }

    return () => {
      if (registration) {
        registration.unregister();
      }
    };
  }, []);

  return {
    registration,
    error,
    supported: 'serviceWorker' in navigator
  };
}
