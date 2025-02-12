"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  PauseIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  id: string;
  name: string;
  ticketNumber: string;
  waitTime: number;
  priority: "normal" | "priority" | "vip";
  status: "waiting" | "serving" | "served" | "cancelled";
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Jean Dupont",
    ticketNumber: "A001",
    waitTime: 15,
    priority: "normal",
    status: "waiting",
  },
  {
    id: "2",
    name: "Marie Martin",
    ticketNumber: "A002",
    waitTime: 10,
    priority: "priority",
    status: "waiting",
  },
  {
    id: "3",
    name: "Pierre Durand",
    ticketNumber: "A003",
    waitTime: 5,
    priority: "vip",
    status: "serving",
  },
];

const priorityColors = {
  normal: "bg-gray-100 text-gray-800",
  priority: "bg-yellow-100 text-yellow-800",
  vip: "bg-purple-100 text-purple-800",
};

export default function ServiceConsole() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<"available" | "busy" | "break">("available");

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStatus("busy");
  };

  const handleStatusChange = (newStatus: "available" | "busy" | "break") => {
    setStatus(newStatus);
    if (newStatus !== "busy") {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
      {/* Liste des clients */}
      <div className="col-span-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">File d'attente</h2>
            <Select
              value={status}
              onValueChange={(value: "available" | "busy" | "break") =>
                handleStatusChange(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Occupé</SelectItem>
                <SelectItem value="break">Pause</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {customers
              .filter((c) => c.status === "waiting")
              .map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={priorityColors[customer.priority]}
                    >
                      {customer.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>#{customer.ticketNumber}</span>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {customer.waitTime}min
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Console de service */}
      <div className="col-span-8">
        {selectedCustomer ? (
          <Card className="h-full">
            {/* En-tête client */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Ticket #{selectedCustomer.ticketNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <PhoneIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <VideoCameraIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <PauseIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive">Terminer</Button>
                </div>
              </div>
            </div>

            {/* Zone de chat */}
            <div className="flex-1 p-6">
              {/* Messages */}
              <div className="h-[calc(100vh-24rem)] overflow-y-auto mb-4">
                {/* TODO: Afficher les messages */}
              </div>

              {/* Zone de saisie */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                <Button>
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <ArrowPathIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                En attente d'un client
              </h2>
              <p className="text-muted-foreground">
                Sélectionnez un client dans la file d'attente pour commencer
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
