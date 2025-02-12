"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingDashboard from "@/components/features/admin/Billing/BillingDashboard";
import PaymentManagement from "@/components/features/admin/Billing/PaymentManagement";
import SubscriptionPlans from "@/components/features/admin/Billing/SubscriptionPlans";
import RevenueReports from "@/components/features/admin/Billing/RevenueReports";

export default function BillingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion Financière</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BillingDashboard />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentManagement />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="reports">
          <RevenueReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
