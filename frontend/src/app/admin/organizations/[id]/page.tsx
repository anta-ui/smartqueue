"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/features/admin/Organizations/UserManagement";
import OrganizationSettings from "@/components/features/admin/Organizations/OrganizationSettings";
import OrganizationAnalytics from "@/components/features/admin/Organizations/OrganizationAnalytics";
import NotificationCenter from "@/components/features/admin/Organizations/NotificationCenter";
import SecuritySettings from "@/components/features/admin/Organizations/SecuritySettings";
import { LegalDocuments } from "@/components/features/admin/Organizations/LegalDocuments";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import type { Organization, OrganizationMetrics } from "@/types/organization";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: org, loading, refresh } = useCache<Organization>({
    key: `organization_${params.id}`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${params.id}`);
      return response.json();
    },
  });

  const { data: metrics } = useCache<OrganizationMetrics>({
    key: `organization_metrics_${params.id}`,
    fetchData: async () => {
      const response = await fetch(`/api/admin/organizations/${params.id}/metrics`);
      return response.json();
    },
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  if (loading || !org) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p className="text-gray-500">{org.contact.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to suspend this organization?")) {
                // Suspendre l'organisation
              }
            }}
          >
            Suspend Organization
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(metrics?.revenue.current || 0)}
                </p>
              </div>
              <span className={`text-sm font-medium ${
                (metrics?.revenue.growth || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                {metrics?.revenue.growth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold">
                  {metrics?.users.current || 0}
                </p>
              </div>
              <span className={`text-sm font-medium ${
                (metrics?.users.growth || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                {metrics?.users.growth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Tickets</p>
                <p className="text-2xl font-semibold">
                  {metrics?.tickets.current || 0}
                </p>
              </div>
              <span className={`text-sm font-medium ${
                (metrics?.tickets.growth || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                {metrics?.tickets.growth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                <p className="text-2xl font-semibold">
                  {metrics?.satisfaction.current || 0}%
                </p>
              </div>
              <span className={`text-sm font-medium ${
                metrics?.satisfaction.trend === "up"
                  ? "text-green-600"
                  : metrics?.satisfaction.trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}>
                {metrics?.satisfaction.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings">
            <CogIcon className="h-5 w-5 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellIcon className="h-5 w-5 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="documents">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Organization Details</h3>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1">
                      {org.address.street}<br />
                      {org.address.city}, {org.address.state} {org.address.postalCode}<br />
                      {org.address.country}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1">
                      {org.contact.name}<br />
                      {org.contact.email}<br />
                      {org.contact.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plan Details</dt>
                    <dd className="mt-1">
                      <span className="capitalize">{org.plan}</span> Plan<br />
                      Billing: {org.billingCycle}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Features & Integrations</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Active Features</h4>
                    <ul className="mt-2 space-y-2">
                      {Object.entries(org.features).map(([key, value]) => (
                        <li key={key} className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${
                            value ? "bg-green-500" : "bg-gray-300"
                          } mr-2`} />
                          {key.replace(/([A-Z])/g, " $1").trim()}
                          {typeof value === "string" && `: ${value}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Integrations</h4>
                    <ul className="mt-2 space-y-2">
                      {org.integrations.map((integration) => (
                        <li key={integration.type} className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${
                            integration.status === "active" ? "bg-green-500" : "bg-gray-300"
                          } mr-2`} />
                          {integration.type}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement organizationId={params.id as string} />
        </TabsContent>

        <TabsContent value="billing">
          {/* Contenu de l'onglet Billing */}
        </TabsContent>

        <TabsContent value="settings">
          <OrganizationSettings organizationId={params.id as string} />
        </TabsContent>

        <TabsContent value="analytics">
          <OrganizationAnalytics organizationId={params.id as string} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter organizationId={params.id as string} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings organizationId={params.id as string} />
        </TabsContent>

        <TabsContent value="documents">
          <LegalDocuments organizationId={params.id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
