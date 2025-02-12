"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/common/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/Dialog";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Plan, PlanFeature } from "@/types/billing";

export default function PlansPage() {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data: plans, loading, refresh } = useCache<Plan[]>({
    key: "billing_plans",
    fetchData: async () => {
      const response = await fetch("/api/admin/billing/plans");
      return response.json();
    },
  });

  const handleSavePlan = async (plan: Plan) => {
    try {
      const response = await fetch(
        `/api/admin/billing/plans${plan.id ? `/${plan.id}` : ""}`,
        {
          method: plan.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(plan),
        }
      );
      
      if (response.ok) {
        refresh();
        setEditingPlan(null);
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        await fetch(`/api/admin/billing/plans/${planId}`, {
          method: "DELETE",
        });
        refresh();
      } catch (error) {
        console.error("Failed to delete plan:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <Button onClick={() => setEditingPlan({} as Plan)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Liste des Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          plans?.map((plan) => (
            <Card key={plan.id} className={plan.metadata.popular ? "ring-2 ring-indigo-500" : ""}>
              <CardHeader>
                {plan.metadata.popular && (
                  <div className="text-xs font-medium text-indigo-600 mb-2">
                    MOST POPULAR
                  </div>
                )}
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="text-gray-500">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold">
                    €{plan.price.monthly}
                    <span className="text-base font-normal text-gray-500">/mo</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    €{plan.price.annual}/yr when billed annually
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Features</h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          {feature.name}
                          {feature.limit && (
                            <span className="text-gray-500">
                              {" "}
                              (up to {feature.limit} {feature.unit})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Users</span>
                      <span>{plan.limits.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Queues</span>
                      <span>{plan.limits.queues}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Storage</span>
                      <span>{plan.limits.storage}GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">API Rate Limit</span>
                      <span>{plan.limits.api.rateLimit}/min</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal d'édition de plan */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan?.id ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingPlan) {
                handleSavePlan(editingPlan);
              }
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editingPlan?.name || ""}
                  onChange={(e) =>
                    setEditingPlan((prev) => ({
                      ...prev!,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={editingPlan?.description || ""}
                  onChange={(e) =>
                    setEditingPlan((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monthly Price (€)
                </label>
                <Input
                  type="number"
                  value={editingPlan?.price.monthly || ""}
                  onChange={(e) =>
                    setEditingPlan((prev) => ({
                      ...prev!,
                      price: {
                        ...prev!.price,
                        monthly: parseFloat(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Annual Price (€)
                </label>
                <Input
                  type="number"
                  value={editingPlan?.price.annual || ""}
                  onChange={(e) =>
                    setEditingPlan((prev) => ({
                      ...prev!,
                      price: {
                        ...prev!.price,
                        annual: parseFloat(e.target.value),
                      },
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Users</label>
                  <Input
                    type="number"
                    value={editingPlan?.limits.users || ""}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({
                        ...prev!,
                        limits: {
                          ...prev!.limits,
                          users: parseInt(e.target.value),
                        },
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Queues</label>
                  <Input
                    type="number"
                    value={editingPlan?.limits.queues || ""}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({
                        ...prev!,
                        limits: {
                          ...prev!.limits,
                          queues: parseInt(e.target.value),
                        },
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Storage (GB)
                  </label>
                  <Input
                    type="number"
                    value={editingPlan?.limits.storage || ""}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({
                        ...prev!,
                        limits: {
                          ...prev!.limits,
                          storage: parseInt(e.target.value),
                        },
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    API Rate Limit (/min)
                  </label>
                  <Input
                    type="number"
                    value={editingPlan?.limits.api.rateLimit || ""}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({
                        ...prev!,
                        limits: {
                          ...prev!.limits,
                          api: {
                            ...prev!.limits.api,
                            rateLimit: parseInt(e.target.value),
                          },
                        },
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Features</h3>
              <div className="space-y-4">
                {editingPlan?.features.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-4">
                    <Input
                      value={feature.name}
                      onChange={(e) => {
                        const newFeatures = [...editingPlan.features];
                        newFeatures[index] = {
                          ...feature,
                          name: e.target.value,
                        };
                        setEditingPlan((prev) => ({
                          ...prev!,
                          features: newFeatures,
                        }));
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        const newFeatures = editingPlan.features.filter(
                          (_, i) => i !== index
                        );
                        setEditingPlan((prev) => ({
                          ...prev!,
                          features: newFeatures,
                        }));
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingPlan((prev) => ({
                      ...prev!,
                      features: [
                        ...prev!.features,
                        {
                          id: Math.random().toString(),
                          name: "",
                          description: "",
                          included: true,
                        },
                      ],
                    }));
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPlan(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
