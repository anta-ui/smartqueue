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

// Types
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending" | "refunded";
  customer: {
    name: string;
    email: string;
  };
  paymentMethod: string;
}

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TX123",
    date: new Date(),
    amount: 299.99,
    currency: "EUR",
    status: "success",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    paymentMethod: "Carte bancaire",
  },
  // Ajoutez plus de transactions mock ici
];

const CURRENCIES = ["EUR", "USD", "GBP", "JPY"];

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [dateRange, setDateRange] = useState("today");

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Période</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Devise</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Statut</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="success">Réussis</SelectItem>
                <SelectItem value="failed">Échoués</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="refunded">Remboursés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Recherche</label>
            <Input type="text" placeholder="ID, email, nom..." />
          </div>
        </div>
      </Card>

      {/* Tableau des transactions */}
      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono">{transaction.id}</TableCell>
                  <TableCell>
                    {format(transaction.date, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.amount} {transaction.currency}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(transaction.status)}
                      variant="secondary"
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                      {transaction.status === "success" && (
                        <Button variant="destructive" size="sm">
                          Rembourser
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Statistiques de paiement */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Taux de réussite</h3>
          <p className="text-3xl font-bold text-green-600">98.5%</p>
          <p className="text-sm text-gray-500">+2.1% vs mois dernier</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Montant total</h3>
          <p className="text-3xl font-bold">45,231€</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Remboursements</h3>
          <p className="text-3xl font-bold text-red-600">1,234€</p>
          <p className="text-sm text-gray-500">Ce mois</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Transactions en échec</h3>
          <p className="text-3xl font-bold text-yellow-600">23</p>
          <p className="text-sm text-gray-500">À traiter</p>
        </Card>
      </div>
    </div>
  );
}
