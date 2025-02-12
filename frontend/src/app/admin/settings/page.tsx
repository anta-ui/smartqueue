"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserManagement from "@/components/features/admin/Users/AdminUserManagement";
import SystemSettings from "@/components/features/admin/Settings/SystemSettings";
import BrandingSettings from "@/components/features/admin/Settings/BrandingSettings";
import {
  UserGroupIcon,
  CogIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration Système</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="system">
            <CogIcon className="h-5 w-5 mr-2" />
            Système
          </TabsTrigger>
          <TabsTrigger value="branding">
            <PaintBrushIcon className="h-5 w-5 mr-2" />
            Personnalisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
