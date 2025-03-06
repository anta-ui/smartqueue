// app/admin-portal/page.jsx
"use client";

import { useEffect } from 'react';

export default function AdminPortal() {
  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    if (!token || userRole !== 'super_admin') {
      window.location.href = '/super-admin/login';
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Portail d'administration</h1>
      <p>Si vous voyez cette page, vous êtes bien authentifié en tant que Super Admin.</p>
    </div>
  );
}