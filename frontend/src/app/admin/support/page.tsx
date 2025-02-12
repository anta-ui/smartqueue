"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupportCenter from "@/components/features/admin/Support/SupportCenter";
import MaintenanceCenter from "@/components/features/admin/Support/MaintenanceCenter";
import {
  LifebuoyIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("support");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support & Maintenance</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="support">
            <LifebuoyIcon className="h-5 w-5 mr-2" />
            Support
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support">
          <SupportCenter />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
