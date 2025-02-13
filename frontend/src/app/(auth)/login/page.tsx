"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// Configuration axios
axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.withCredentials = true;

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {

  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<LoginFormData> = {};
      error.errors.forEach((err: any) => {
        validationErrors[err.path[0] as keyof LoginFormData] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post("/auth/token/", formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // Important pour les cookies
      });
  
      // Stocker dans localStorage ET définir le cookie
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
  
      // Définir le cookie côté client (temporaire)
      document.cookie = `access_token=${response.data.access}; path=/`;
  
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
  
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
  
      router.push('/dashboard');
    } catch (error: any) {
      // ... gestion d'erreur existante ...
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/images/back2.jpeg')`,
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      
      <div className="relative z-20 w-full max-w-md mx-15">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-xl p-10 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">
              SmartQueue
            </h1>
            <p className="text-gray-900">Connectez-vous à votre compte</p>
          </div>
  
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 pl-1">{errors.email}</p>
                )}
              </div>
  
              <div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 pl-1">{errors.password}</p>
                )}
              </div>
            </div>
  
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
  
          <div className="pt-4 text-center text-xl border-t border-gray-200">
            <p className="text-sm text-gray-900">
              Pas encore inscrit ?{" "}
              <Link 
                href="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}