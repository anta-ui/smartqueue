"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { WebhooksList } from "@/components/features/admin/Webhooks/WebhooksList";
import { WebhookForm } from "@/components/features/admin/Webhooks/WebhookForm";
import { WebhookLogs } from "@/components/features/admin/Webhooks/WebhookLogs";
import { WebhookMonitoring } from "@/components/features/admin/Webhooks/WebhookMonitoring";
import { useToast } from "@/hooks/useToast";
import { useCache } from "@/hooks/cache/useCache";
import type { WebhookEndpoint } from "@/types/webhook";

export default function WebhooksPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | undefined>();
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);

  const {
    data: webhooks,
    loading,
    refresh,
  } = useCache<WebhookEndpoint[]>({
    key: `organization_${params.id}_webhooks`,
    fetchData: async () => {
      const response = await fetch(`/api/organizations/${params.id}/webhooks`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des webhooks");
      }
      return response.json();
    },
  });

  const handleCreate = async (data: Partial<WebhookEndpoint>) => {
    try {
      const response = await fetch(`/api/organizations/${params.id}/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du webhook");
      }

      toast({
        title: "Webhook créé",
        description: "Le webhook a été créé avec succès",
      });

      refresh();
      setFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: Partial<WebhookEndpoint>) => {
    if (!editingWebhook) return;

    try {
      const response = await fetch(
        `/api/organizations/${params.id}/webhooks/${editingWebhook.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du webhook");
      }

      toast({
        title: "Webhook mis à jour",
        description: "Le webhook a été mis à jour avec succès",
      });

      refresh();
      setEditingWebhook(undefined);
      setFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (webhook: WebhookEndpoint) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce webhook ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/organizations/${params.id}/webhooks/${webhook.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du webhook");
      }

      toast({
        title: "Webhook supprimé",
        description: "Le webhook a été supprimé avec succès",
      });

      refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (webhook: WebhookEndpoint, active: boolean) => {
    try {
      const response = await fetch(
        `/api/organizations/${params.id}/webhooks/${webhook.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur lors de ${active ? "l'activation" : "la désactivation"} du webhook`
        );
      }

      toast({
        title: active ? "Webhook activé" : "Webhook désactivé",
        description: `Le webhook a été ${
          active ? "activé" : "désactivé"
        } avec succès`,
      });

      refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleViewDeliveries = (webhook: WebhookEndpoint) => {
    setSelectedWebhook(webhook);
    setShowLogs(true);
  };

  const handleViewMonitoring = (webhook: WebhookEndpoint) => {
    setSelectedWebhook(webhook);
    setShowMonitoring(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <Button onClick={() => setFormOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau Webhook
        </Button>
      </div>

      <WebhooksList
        webhooks={webhooks || []}
        onEdit={(webhook) => {
          setEditingWebhook(webhook);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onViewDeliveries={handleViewDeliveries}
        onViewMonitoring={handleViewMonitoring}
      />

      {formOpen && (
        <WebhookForm
          webhook={editingWebhook}
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingWebhook(undefined);
          }}
          onSubmit={editingWebhook ? handleUpdate : handleCreate}
        />
      )}

      {showLogs && selectedWebhook && (
        <Dialog open={showLogs} onOpenChange={setShowLogs}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Historique des Livraisons - {selectedWebhook.name}</DialogTitle>
            </DialogHeader>
            <WebhookLogs
              organizationId={params.id}
              webhookId={selectedWebhook.id}
            />
          </DialogContent>
        </Dialog>
      )}

      {showMonitoring && selectedWebhook && (
        <Dialog open={showMonitoring} onOpenChange={setShowMonitoring}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Monitoring - {selectedWebhook.name}</DialogTitle>
              <DialogDescription>
                Métriques et performances des dernières 24 heures
              </DialogDescription>
            </DialogHeader>
            <WebhookMonitoring
              organizationId={params.id}
              webhookId={selectedWebhook.id}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
