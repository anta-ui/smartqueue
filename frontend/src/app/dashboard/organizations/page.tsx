// src/app/dashboard/organizations/page.tsx
"use client";

import { useState } from "react";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function OrganizationsPage() {
  const { organizations, loading, error } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les organisations seulement si nous avons des données
  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
        <Link href="/dashboard/organizations/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Nouvelle Organisation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une organisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucune organisation trouvée" : "Aucune organisation disponible"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === "active"
                            ? "bg-green-100 text-green-800"
                            : org.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {org.status}
                      </span>
                    </TableCell>
                    <TableCell>{org.memberCount ?? 0}</TableCell>
                    <TableCell>{org.plan ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/organizations/${org.id}`}>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}