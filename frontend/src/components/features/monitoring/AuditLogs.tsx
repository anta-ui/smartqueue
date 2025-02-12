"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  UserIcon,
  KeyIcon,
  DocumentIcon,
  CogIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";

interface AuditLog {
  id: string;
  action: string;
  category: "auth" | "data" | "config" | "system";
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: Date;
  details: string;
  ip: string;
  status: "success" | "failure" | "warning";
}

const MOCK_LOGS: AuditLog[] = [
  {
    id: "log-1",
    action: "Connexion",
    category: "auth",
    user: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
    },
    timestamp: new Date(),
    details: "Connexion réussie",
    ip: "192.168.1.1",
    status: "success",
  },
  {
    id: "log-2",
    action: "Modification configuration",
    category: "config",
    user: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    timestamp: new Date(Date.now() - 1800000),
    details: "Mise à jour des paramètres de sécurité",
    ip: "192.168.1.2",
    status: "success",
  },
  {
    id: "log-3",
    action: "Suppression données",
    category: "data",
    user: {
      id: "user-3",
      name: "Bob Wilson",
      email: "bob@example.com",
    },
    timestamp: new Date(Date.now() - 3600000),
    details: "Tentative de suppression non autorisée",
    ip: "192.168.1.3",
    status: "failure",
  },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryIcon = (category: AuditLog["category"]) => {
    switch (category) {
      case "auth":
        return <KeyIcon className="h-5 w-5" />;
      case "data":
        return <DocumentIcon className="h-5 w-5" />;
      case "config":
        return <CogIcon className="h-5 w-5" />;
      case "system":
        return <ArrowPathIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: AuditLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failure":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredLogs = logs
    .filter((log) => {
      if (category === "all") return true;
      return log.category === category;
    })
    .filter((log) => {
      if (!searchQuery) return true;
      return (
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold">Logs d'Audit</h2>
        <p className="text-sm text-muted-foreground">
          Suivez toutes les actions importantes du système
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par action, utilisateur ou détails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="auth">Authentification</SelectItem>
              <SelectItem value="data">Données</SelectItem>
              <SelectItem value="config">Configuration</SelectItem>
              <SelectItem value="system">Système</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </Card>

      {/* Liste des logs */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(log.timestamp, "dd/MM/yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(log.category)}
                    <span className="capitalize">{log.category}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div>{log.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {log.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
