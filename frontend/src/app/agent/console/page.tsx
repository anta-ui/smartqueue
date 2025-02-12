"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceConsole from "@/components/features/agent/ServiceConsole";
import CustomerInteractionLog from "@/components/features/agent/CustomerInteractionLog";
import ServicePointManager from "@/components/features/agent/ServicePointManager";

export default function AgentConsolePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Console Agent</h1>
        <p className="text-muted-foreground">
          Gérez vos interactions et votre point de service
        </p>
      </div>

      <Tabs defaultValue="service" className="space-y-8">
        <TabsList>
          <TabsTrigger value="service">Service Client</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="point">Point de Service</TabsTrigger>
        </TabsList>

        <TabsContent value="service">
          <ServiceConsole />
        </TabsContent>

        <TabsContent value="history">
          <CustomerInteractionLog />
        </TabsContent>

        <TabsContent value="point">
          <ServicePointManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
