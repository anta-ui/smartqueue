"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemHealthMonitor from "@/components/features/monitoring/SystemHealthMonitor";
import PerformanceMetrics from "@/components/features/monitoring/PerformanceMetrics";
import AlertsMonitoring from "@/components/features/monitoring/AlertsMonitoring";
import AuditLogs from "@/components/features/monitoring/AuditLogs";

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monitoring Système</h1>
        <p className="text-muted-foreground">
          Surveillez l'état et les performances du système en temps réel
        </p>
      </div>

      <Tabs defaultValue="health" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">État du Système</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="audit">Logs d'Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <SystemHealthMonitor />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsMonitoring />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
