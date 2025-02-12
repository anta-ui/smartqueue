"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/DropdownMenu";
import { OrganizationExport } from "@/components/features/admin/Organizations/OrganizationExport";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  BanknotesIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Organization, OrganizationStatus, PlanType } from "@/types/organization";

const statusColors: Record<OrganizationStatus, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

const planColors: Record<PlanType, string> = {
  free: "bg-gray-100 text-gray-800",
  starter: "bg-blue-100 text-blue-800",
  professional: "bg-purple-100 text-purple-800",
  enterprise: "bg-indigo-100 text-indigo-800",
};

interface AdvancedFilters {
  status: OrganizationStatus[];
  plan: PlanType[];
  billingCycle: ("monthly" | "annual")[];
  region: string[];
  minUsers: number | null;
  maxUsers: number | null;
  minRevenue: number | null;
  maxRevenue: number | null;
  createdAfter: string | null;
  createdBefore: string | null;
  hasCustomDomain: boolean | null;
  hasApiEnabled: boolean | null;
}

const initialAdvancedFilters: AdvancedFilters = {
  status: [],
  plan: [],
  billingCycle: [],
  region: [],
  minUsers: null,
  maxUsers: null,
  minRevenue: null,
  maxRevenue: null,
  createdAfter: null,
  createdBefore: null,
  hasCustomDomain: null,
  hasApiEnabled: null,
};

const regions = [
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Africa",
  "Oceania",
];

export default function OrganizationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(initialAdvancedFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Mettre à jour le compteur de filtres actifs
  const updateActiveFilterCount = useCallback((filters: AdvancedFilters) => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (Array.isArray(value) && value.length > 0) return acc + 1;
      if (value !== null && value !== initialAdvancedFilters[key as keyof AdvancedFilters]) return acc + 1;
      return acc;
    }, 0);
    setActiveFilterCount(count);
  }, []);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setAdvancedFilters(initialAdvancedFilters);
    updateActiveFilterCount(initialAdvancedFilters);
    setIsFilterOpen(false);
  }, [updateActiveFilterCount]);

  const { data, loading, refresh } = useCache({
    key: `organizations_${page}_${JSON.stringify(advancedFilters)}_${search}`,
    fetchData: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        ...advancedFilters,
      });
      const response = await fetch(`/api/admin/organizations?${params}`);
      return response.json();
    },
  });

  const handleAction = useCallback(async (action: string, org: Organization) => {
    switch (action) {
      case "view":
        router.push(`/organizations/${org.id}`);
        break;
      case "suspend":
        if (confirm(`Are you sure you want to suspend ${org.name}?`)) {
          await fetch(`/api/admin/organizations/${org.id}/suspend`, {
            method: "POST",
          });
          refresh();
        }
        break;
      case "contact":
        router.push(`/organizations/${org.id}/contact`);
        break;
      case "billing":
        router.push(`/organizations/${org.id}/billing`);
        break;
    }
  }, [router, refresh]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Button onClick={() => router.push("/organizations/new")}>
          Add Organization
        </Button>
      </div>

      {/* Filtres et Recherche */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search organizations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                <FunnelIcon className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="info" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <OrganizationExport
                filters={advancedFilters}
                search={search}
              />
              <Button variant="outline" onClick={refresh}>
                <ArrowPathIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Organisations */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                data?.organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.contact.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[org.status]}`}>
                        {org.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[org.plan]}`}>
                        {org.plan}
                      </span>
                    </TableCell>
                    <TableCell>{org.usage.activeUsers}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(org.metrics.mrr)}
                    </TableCell>
                    <TableCell>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("view", org)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("contact", org)}>
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("billing", org)}>
                            <BanknotesIcon className="h-4 w-4 mr-2" />
                            Billing
                          </DropdownMenuItem>
                          {org.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleAction("suspend", org)}
                              className="text-red-600"
                            >
                              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.total)} of {data.total} organizations
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page * pageSize >= data.total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Filtres avancés */}
      <Sheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <Button variant="ghost" onClick={resetFilters}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <SheetContent>
          <ScrollArea className="p-4">
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {["active", "suspended", "pending", "archived"].map((status) => (
                    <Checkbox
                      key={status}
                      checked={advancedFilters.status.includes(status as OrganizationStatus)}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          status: e.target.checked
                            ? [...prev.status, status as OrganizationStatus]
                            : prev.status.filter(s => s !== status)
                        }));
                        updateActiveFilterCount(prev => ({ ...prev, status: e.target.checked ? [...prev.status, status as OrganizationStatus] : prev.status.filter(s => s !== status) }));
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div>
                <Label>Plan</Label>
                <div className="flex flex-wrap gap-2">
                  {["free", "starter", "professional", "enterprise"].map((plan) => (
                    <Checkbox
                      key={plan}
                      checked={advancedFilters.plan.includes(plan as PlanType)}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          plan: e.target.checked
                            ? [...prev.plan, plan as PlanType]
                            : prev.plan.filter(p => p !== plan)
                        }));
                        updateActiveFilterCount(prev => ({ ...prev, plan: e.target.checked ? [...prev.plan, plan as PlanType] : prev.plan.filter(p => p !== plan) }));
                      }}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div>
                <Label>Billing Cycle</Label>
                <div className="flex flex-wrap gap-2">
                  {["monthly", "annual"].map((cycle) => (
                    <Checkbox
                      key={cycle}
                      checked={advancedFilters.billingCycle.includes(cycle)}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          billingCycle: e.target.checked
                            ? [...prev.billingCycle, cycle]
                            : prev.billingCycle.filter(c => c !== cycle)
                        }));
                        updateActiveFilterCount(prev => ({ ...prev, billingCycle: e.target.checked ? [...prev.billingCycle, cycle] : prev.billingCycle.filter(c => c !== cycle) }));
                      }}
                    >
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div>
                <Label>Region</Label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <Checkbox
                      key={region}
                      checked={advancedFilters.region.includes(region)}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          region: e.target.checked
                            ? [...prev.region, region]
                            : prev.region.filter(r => r !== region)
                        }));
                        updateActiveFilterCount(prev => ({ ...prev, region: e.target.checked ? [...prev.region, region] : prev.region.filter(r => r !== region) }));
                      }}
                    >
                      {region}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div>
                <Label>Min Users</Label>
                <Input
                  type="number"
                  value={advancedFilters.minUsers ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, minUsers: e.target.valueAsNumber }));
                    updateActiveFilterCount(prev => ({ ...prev, minUsers: e.target.valueAsNumber }));
                  }}
                />
              </div>
              <div>
                <Label>Max Users</Label>
                <Input
                  type="number"
                  value={advancedFilters.maxUsers ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, maxUsers: e.target.valueAsNumber }));
                    updateActiveFilterCount(prev => ({ ...prev, maxUsers: e.target.valueAsNumber }));
                  }}
                />
              </div>
              <div>
                <Label>Min Revenue</Label>
                <Input
                  type="number"
                  value={advancedFilters.minRevenue ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, minRevenue: e.target.valueAsNumber }));
                    updateActiveFilterCount(prev => ({ ...prev, minRevenue: e.target.valueAsNumber }));
                  }}
                />
              </div>
              <div>
                <Label>Max Revenue</Label>
                <Input
                  type="number"
                  value={advancedFilters.maxRevenue ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, maxRevenue: e.target.valueAsNumber }));
                    updateActiveFilterCount(prev => ({ ...prev, maxRevenue: e.target.valueAsNumber }));
                  }}
                />
              </div>
              <div>
                <Label>Created After</Label>
                <Input
                  type="date"
                  value={advancedFilters.createdAfter ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, createdAfter: e.target.value }));
                    updateActiveFilterCount(prev => ({ ...prev, createdAfter: e.target.value }));
                  }}
                />
              </div>
              <div>
                <Label>Created Before</Label>
                <Input
                  type="date"
                  value={advancedFilters.createdBefore ?? ""}
                  onChange={(e) => {
                    setAdvancedFilters(prev => ({ ...prev, createdBefore: e.target.value }));
                    updateActiveFilterCount(prev => ({ ...prev, createdBefore: e.target.value }));
                  }}
                />
              </div>
              <div>
                <Label>Has Custom Domain</Label>
                <RadioGroup
                  value={advancedFilters.hasCustomDomain}
                  onChange={(value) => {
                    setAdvancedFilters(prev => ({ ...prev, hasCustomDomain: value }));
                    updateActiveFilterCount(prev => ({ ...prev, hasCustomDomain: value }));
                  }}
                >
                  <RadioGroupItem value={true}>Yes</RadioGroupItem>
                  <RadioGroupItem value={false}>No</RadioGroupItem>
                  <RadioGroupItem value={null}>Any</RadioGroupItem>
                </RadioGroup>
              </div>
              <div>
                <Label>Has API Enabled</Label>
                <RadioGroup
                  value={advancedFilters.hasApiEnabled}
                  onChange={(value) => {
                    setAdvancedFilters(prev => ({ ...prev, hasApiEnabled: value }));
                    updateActiveFilterCount(prev => ({ ...prev, hasApiEnabled: value }));
                  }}
                >
                  <RadioGroupItem value={true}>Yes</RadioGroupItem>
                  <RadioGroupItem value={false}>No</RadioGroupItem>
                  <RadioGroupItem value={null}>Any</RadioGroupItem>
                </RadioGroup>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
