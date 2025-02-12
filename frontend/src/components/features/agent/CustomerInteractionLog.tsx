"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TagIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface Interaction {
  id: string;
  customerId: string;
  customerName: string;
  type: "chat" | "call" | "counter";
  status: "resolved" | "pending" | "escalated";
  timestamp: string;
  duration: number;
  notes: string;
  tags: string[];
}

const MOCK_INTERACTIONS: Interaction[] = [
  {
    id: "1",
    customerId: "C001",
    customerName: "Jean Dupont",
    type: "counter",
    status: "resolved",
    timestamp: "2025-01-29T14:30:00Z",
    duration: 15,
    notes: "Demande de renouvellement de carte traitée avec succès",
    tags: ["renouvellement", "carte"],
  },
  {
    id: "2",
    customerId: "C002",
    customerName: "Marie Martin",
    type: "chat",
    status: "pending",
    timestamp: "2025-01-29T14:45:00Z",
    duration: 10,
    notes: "En attente de documents supplémentaires",
    tags: ["documents", "en-attente"],
  },
];

const statusColors = {
  resolved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  escalated: "bg-red-100 text-red-800",
};

export default function CustomerInteractionLog() {
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(
    null
  );
  const [newNote, setNewNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch =
      interaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || interaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddNote = () => {
    if (!selectedInteraction || !newNote.trim()) return;

    const updatedInteractions = interactions.map((interaction) =>
      interaction.id === selectedInteraction.id
        ? {
            ...interaction,
            notes: `${interaction.notes}\n\n${new Date().toISOString()}: ${newNote}`,
          }
        : interaction
    );

    setInteractions(updatedInteractions);
    setNewNote("");
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Liste des interactions */}
      <div className="col-span-5 space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="escalated">Escaladés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Liste */}
            <div className="space-y-2">
              {filteredInteractions.map((interaction) => (
                <div
                  key={interaction.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedInteraction?.id === interaction.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedInteraction(interaction)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {interaction.customerName}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[interaction.status]}
                    >
                      {interaction.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      {interaction.tags.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Détails de l'interaction */}
      <div className="col-span-7">
        {selectedInteraction ? (
          <Card className="p-6">
            {/* En-tête */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedInteraction.customerName}
                </h2>
                <Badge
                  variant="secondary"
                  className={statusColors[selectedInteraction.status]}
                >
                  {selectedInteraction.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {new Date(selectedInteraction.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  {selectedInteraction.type}
                </div>
                <div>{selectedInteraction.duration} min</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedInteraction.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold">Notes</h3>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {selectedInteraction.notes}
              </div>

              {/* Ajouter une note */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Ajouter une note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={handleAddNote}>
                  Ajouter une note
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <ChatBubbleLeftIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Sélectionnez une interaction
              </h2>
              <p className="text-muted-foreground">
                Choisissez une interaction dans la liste pour voir les détails
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
