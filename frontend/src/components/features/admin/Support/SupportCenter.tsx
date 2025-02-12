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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  sla?: {
    deadline: string;
    breached: boolean;
  };
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
}

export default function SupportCenter() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(
    null
  );
  const [ticketFilter, setTicketFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tickets, loading: ticketsLoading, refresh: refreshTickets } =
    useCache<Ticket[]>({
      key: "support_tickets",
      fetchData: async () => {
        const response = await fetch("/api/admin/support/tickets");
        return response.json();
      },
    });

  const { data: articles, loading: articlesLoading, refresh: refreshArticles } =
    useCache<KnowledgeArticle[]>({
      key: "knowledge_base",
      fetchData: async () => {
        const response = await fetch("/api/admin/support/knowledge");
        return response.json();
      },
    });

  const handleTicketUpdate = async (
    ticketId: string,
    data: Partial<Ticket>
  ) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        refreshTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const handleArticleSubmit = async (
    article: Partial<KnowledgeArticle>
  ) => {
    try {
      const response = await fetch("/api/admin/support/knowledge", {
        method: selectedArticle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });

      if (response.ok) {
        refreshArticles();
        setSelectedArticle(null);
      }
    } catch (error) {
      console.error("Failed to save article:", error);
    }
  };

  const filteredTickets = tickets?.filter((ticket) => {
    if (ticketFilter !== "all" && ticket.status !== ticketFilter) return false;
    if (
      searchQuery &&
      !ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredArticles = articles?.filter((article) =>
    searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Centre de Support</h2>
          <p className="text-sm text-gray-500">
            Gérez les tickets de support et la base de connaissances
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="tickets" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tickets">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="knowledge">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Base de Connaissances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant={ticketFilter === "all" ? "default" : "outline"}
                      onClick={() => setTicketFilter("all")}
                    >
                      Tous
                    </Button>
                    <Button
                      variant={ticketFilter === "open" ? "default" : "outline"}
                      onClick={() => setTicketFilter("open")}
                    >
                      Ouverts
                    </Button>
                    <Button
                      variant={
                        ticketFilter === "in_progress" ? "default" : "outline"
                      }
                      onClick={() => setTicketFilter("in_progress")}
                    >
                      En Cours
                    </Button>
                    <Button
                      variant={ticketFilter === "resolved" ? "default" : "outline"}
                      onClick={() => setTicketFilter("resolved")}
                    >
                      Résolus
                    </Button>
                  </div>
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {ticketsLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Assigné à</TableHead>
                        <TableHead>Mis à jour</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets?.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ticket.priority === "critical"
                                  ? "destructive"
                                  : ticket.priority === "high"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ticket.status === "resolved"
                                  ? "success"
                                  : ticket.status === "closed"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ticket.sla && (
                              <div className="flex items-center gap-2">
                                <ClockIcon
                                  className={`h-5 w-5 ${
                                    ticket.sla.breached
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }`}
                                />
                                {new Date(ticket.sla.deadline).toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{ticket.assignedTo || "-"}</TableCell>
                          <TableCell>
                            {new Date(ticket.updatedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="knowledge">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button onClick={() => setSelectedArticle({} as KnowledgeArticle)}>
                    Nouvel Article
                  </Button>
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {articlesLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles?.map((article) => (
                      <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedArticle(article)}>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{article.title}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {article.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>{article.author}</span>
                            <span>
                              {new Date(article.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Ticket */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Ticket</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedTicket.title}</h3>
                <p className="text-sm text-gray-500">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <select
                    className="w-full mt-1 border rounded-md"
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleTicketUpdate(selectedTicket.id, {
                        status: e.target.value as Ticket["status"],
                      })
                    }
                  >
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En Cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <select
                    className="w-full mt-1 border rounded-md"
                    value={selectedTicket.priority}
                    onChange={(e) =>
                      handleTicketUpdate(selectedTicket.id, {
                        priority: e.target.value as Ticket["priority"],
                      })
                    }
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Assigner à</label>
                <Input
                  value={selectedTicket.assignedTo || ""}
                  onChange={(e) =>
                    handleTicketUpdate(selectedTicket.id, {
                      assignedTo: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Article */}
      <Dialog
        open={!!selectedArticle}
        onOpenChange={() => setSelectedArticle(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedArticle?.id ? "Modifier l'Article" : "Nouvel Article"}
            </DialogTitle>
          </DialogHeader>

          {selectedArticle && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleArticleSubmit({
                  ...selectedArticle,
                  title: formData.get("title") as string,
                  content: formData.get("content") as string,
                  category: formData.get("category") as string,
                  tags: (formData.get("tags") as string).split(","),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  name="title"
                  defaultValue={selectedArticle.title}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contenu</label>
                <textarea
                  name="content"
                  className="w-full mt-1 border rounded-md"
                  rows={10}
                  defaultValue={selectedArticle.content}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Input
                  name="category"
                  defaultValue={selectedArticle.category}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  name="tags"
                  defaultValue={selectedArticle.tags?.join(",")}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedArticle(null)}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
