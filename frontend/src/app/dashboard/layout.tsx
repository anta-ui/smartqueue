"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  QueueListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/hooks/auth/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Organisations", href: "/dashboard/organizations", icon: BuildingOfficeIcon },
  { name: "Queues", href: "/dashboard/queues", icon: QueueListIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/login"; // Rediriger vers la page de connexion après la déconnexion
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <span className="text-2xl font-bold text-indigo-600">SmartQueue</span>
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
                  {user?.firstname?.[0]}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6" />
              Logout
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