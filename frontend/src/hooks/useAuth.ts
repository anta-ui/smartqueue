// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si le token existe côté client
    const checkAuth = () => {
      // Utilisez window pour s'assurer que c'est côté client
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log('Pas de token d\'accès');
          router.push('/login');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated };
};