'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Configuration axios pour cette requête
  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/token/", formData);
      
      // Vérifier le statut de superadmin
      const isSuperAdmin = 
        response.data.user?.is_superuser || 
        response.data.user?.is_superadmin || 
        response.data.user?.role === 'super_admin';

      if (!isSuperAdmin) {
        throw new Error("Vous n'avez pas les droits de Super Admin.");
      }

      // Stocker les tokens de manière sécurisée
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', 'super_admin');

      // Définir les cookies (optionnel mais recommandé)
      document.cookie = `access_token=${response.data.access}; path=/; secure; samesite=strict`;
      document.cookie = `refresh_token=${response.data.refresh}; path=/; secure; samesite=strict`;

      // Toast de succès
      toast({
        title: "Connexion réussie",
        description: "Redirection vers le tableau de bord...",
        duration: 2000
      });

      // Redirection programmatique
      setTimeout(() => {
        router.push('/super-admin/dashboard');
        // Alternative si la méthode précédente ne fonctionne pas
        window.location.href = '/super-admin/dashboard';
      }, 500);

    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.detail || error.message || "Une erreur est survenue",
        variant: "destructive",
        duration: 3000
      });
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Super Admin</h1>
          <p className="text-gray-400 mt-2">Connectez-vous pour accéder au panneau d'administration</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 bg-gray-700 text-white border-gray-600"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Mot de passe
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 bg-gray-700 text-white border-gray-600"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}