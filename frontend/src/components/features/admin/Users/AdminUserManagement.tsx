"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { AdminUser, AdminRole } from "@/types/admin";

const ROLES: { value: AdminRole; label: string; description: string }[] = [
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Accès complet à toutes les fonctionnalités",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Gestion des organisations et des utilisateurs",
  },
  {
    value: "support",
    label: "Support",
    description: "Accès au support et à la gestion des tickets",
  },
  {
    value: "billing",
    label: "Billing",
    description: "Gestion de la facturation et des paiements",
  },
  {
    value: "readonly",
    label: "Read Only",
    description: "Accès en lecture seule",
  },
];

export default function AdminUserManagement() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");

  const { data: users, loading, refresh } = useCache<AdminUser[]>({
    key: "admin_users",
    fetchData: async () => {
      const response = await fetch("/api/admin/users");
      return response.json();
    },
  });

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const userData = {
        email: formData.get("email"),
        name: formData.get("name"),
        role: formData.get("role"),
        permissions: Array.from(formData.getAll("permissions")),
        twoFactorEnabled: formData.get("twoFactorEnabled") === "true",
      };

      const response = await fetch("/api/admin/users", {
        method: selectedUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        refresh();
        setIsAddingUser(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      refresh();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestion des Administrateurs</h2>
          <p className="text-sm text-gray-500">
            Gérez les accès et les permissions des administrateurs
          </p>
        </div>
        <Button onClick={() => setIsAddingUser(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter un Admin
        </Button>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Rechercher un administrateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière Connexion</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROLES.find((r) => r.value === user.role)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "success" : "secondary"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Jamais"}
                  </TableCell>
                  <TableCell>
                    {user.twoFactorEnabled ? (
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserDelete(user.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={isAddingUser || !!selectedUser}
        onOpenChange={() => {
          setIsAddingUser(false);
          setSelectedUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Modifier l'administrateur" : "Nouvel administrateur"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                defaultValue={selectedUser?.email}
              />
            </div>

            <div>
              <Label>Nom</Label>
              <Input
                name="name"
                required
                defaultValue={selectedUser?.name}
              />
            </div>

            <div>
              <Label>Rôle</Label>
              <select
                name="role"
                className="w-full mt-1 border rounded-md"
                defaultValue={selectedUser?.role || "readonly"}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Double Authentification</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  name="twoFactorEnabled"
                  defaultChecked={selectedUser?.twoFactorEnabled}
                />
                <span className="text-sm text-gray-500">
                  Activer la double authentification
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingUser(false);
                  setSelectedUser(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedUser ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
