"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditLogs from "@/components/features/admin/Security/AuditLogs";
import SecurityAlerts from "@/components/features/admin/Security/SecurityAlerts";
import SecurityPolicies from "@/components/features/admin/Security/SecurityPolicies";
import GDPRManagement from "@/components/features/admin/Security/GDPRManagement";
import Certifications from "@/components/features/admin/Security/Certifications";
import {
  ClipboardDocumentListIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState("audit");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sécurité & Conformité</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="audit">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <BellAlertIcon className="h-5 w-5 mr-2" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="policies">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Politiques
          </TabsTrigger>
          <TabsTrigger value="gdpr">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            RGPD
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <CheckBadgeIcon className="h-5 w-5 mr-2" />
            Certifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlerts />
        </TabsContent>

        <TabsContent value="policies">
          <SecurityPolicies />
        </TabsContent>

        <TabsContent value="gdpr">
          <GDPRManagement />
        </TabsContent>

        <TabsContent value="certifications">
          <Certifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}
