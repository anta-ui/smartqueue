// app/super-admin/layout.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Tableau de bord", href: "/super-admin/dashboard", icon: HomeIcon },
  { name: "Organisations", href: "/super-admin/organizations", icon: BuildingOfficeIcon },
  { name: "Facturation", href: "/super-admin/billing", icon: CurrencyDollarIcon },
  { name: "Paramètres système", href: "/super-admin/settings", icon: Cog6ToothIcon },
  { name: "Alertes", href: "/super-admin/alerts", icon: ExclamationTriangleIcon },
  { name: "Maintenance", href: "/super-admin/maintenance", icon: ClockIcon },
  { name: "Sauvegardes", href: "/super-admin/backups", icon: ArchiveBoxIcon },
];

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    if (!token || userRole !== 'super_admin') {
      router.push('/super-admin/login');
      return;
    }
    
    setIsAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    router.push('/super-admin/login');
  };

  if (!isAuthenticated && pathname !== '/super-admin/login') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/super-admin/login') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <span className="text-2xl font-bold text-indigo-600">Super Admin</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  S
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  Super Admin
                </p>
                <p className="text-xs text-gray-500">Administration Système</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pl-64">
        <main className="py-6 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}