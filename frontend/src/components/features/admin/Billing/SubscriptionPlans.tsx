"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Feature {
  id: string;
  name: string;
  included: boolean;
  limit?: number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: Feature[];
  isPopular: boolean;
  isActive: boolean;
}

const MOCK_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Pour les petites entreprises",
    price: 29,
    billingPeriod: "monthly",
    features: [
      { id: "f1", name: "Jusqu'à 5 utilisateurs", included: true, limit: 5 },
      { id: "f2", name: "Support par email", included: true },
      { id: "f3", name: "API access", included: false },
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les entreprises en croissance",
    price: 99,
    billingPeriod: "monthly",
    features: [
      { id: "f1", name: "Jusqu'à 20 utilisateurs", included: true, limit: 20 },
      { id: "f2", name: "Support prioritaire", included: true },
      { id: "f3", name: "API access", included: true },
    ],
    isPopular: true,
    isActive: true,
  },
];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Plans d'abonnement</h2>
          <p className="text-gray-500">
            Gérez vos offres et tarifs d'abonnement
          </p>
        </div>
        <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau plan</DialogTitle>
              <DialogDescription>
                Créez un nouveau plan d'abonnement avec ses caractéristiques
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input id="name" placeholder="ex: Pro Plus" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prix mensuel (€)</Label>
                <Input id="price" type="number" min="0" step="0.01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Description courte du plan" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="popular" />
                <Label htmlFor="popular">Plan populaire</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingPlan(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des plans */}
      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.isPopular && (
                    <Badge variant="secondary">Populaire</Badge>
                  )}
                  {!plan.isActive && (
                    <Badge variant="destructive">Inactif</Badge>
                  )}
                </div>
                <p className="text-gray-500">{plan.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="destructive" size="sm">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">{plan.price}€</span>
              <span className="text-gray-500">/ mois</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Fonctionnalités incluses :</h4>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature.id}
                    className={`flex items-center gap-2 ${
                      feature.included ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {feature.included ? (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    {feature.name}
                    {feature.limit && (
                      <span className="text-gray-500">
                        (limite: {feature.limit})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Statistiques du plan :</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Abonnés actifs</p>
                  <p className="text-xl font-semibold">127</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenu mensuel</p>
                  <p className="text-xl font-semibold">3,683€</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taux de conversion</p>
                  <p className="text-xl font-semibold">8.4%</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
