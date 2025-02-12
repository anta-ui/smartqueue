"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPinIcon,
  QueueListIcon,
  MapIcon,
  ListBulletIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { QueueMap } from "@/components/features/client/QueueMap";
import { QRScanner } from "@/components/features/client/QRScanner";
import { QueueHistory } from "@/components/features/client/QueueHistory";
import { QueueStats } from "@/components/features/client/QueueStats";
import { QueueSuggestions } from "@/components/features/client/QueueSuggestions";
import { useQueueHistory } from "@/hooks/queue/useQueueHistory";
import type { Queue, Organization } from "@/types/queue";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function ClientHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyOrganizations, setNearbyOrganizations] = useState<Organization[]>([]);
  const { addToHistory, getQueueFromHistory } = useQueueHistory();

  useEffect(() => {
    loadOrganizations();
    // Demander la géolocalisation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          fetchNearbyOrganizations(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location services.");
          // Charger les organisations par défaut
          fetchNearbyOrganizations();
        }
      );
    }
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyOrganizations = async (lat?: number, lng?: number) => {
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append("lat", lat.toString());
        params.append("lng", lng.toString());
      }
      
      const response = await fetch(`/api/organizations/nearby?${params}`);
      const data = await response.json();
      setNearbyOrganizations(data);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateDistance = (orgLat: number, orgLng: number): string => {
    if (!location) return "N/A";

    const R = 6371; // Rayon de la Terre en km
    const dLat = ((orgLat - location.latitude) * Math.PI) / 180;
    const dLon = ((orgLng - location.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.latitude * Math.PI) / 180) *
        Math.cos((orgLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  const handleQRCodeScanned = async (qrCodeMessage: string) => {
    try {
      // Format attendu: https://smartqueue.app/q/{queueId}
      const url = new URL(qrCodeMessage);
      const queueId = url.pathname.split("/").pop();
      
      if (queueId) {
        // Vérifier si la file est dans l'historique
        const historyItem = getQueueFromHistory(queueId);
        
        if (historyItem) {
          // Rediriger directement si on a déjà les infos
          router.push(`/queue/${queueId}`);
        } else {
          // Charger les infos de la file et l'ajouter à l'historique
          const response = await fetch(`/api/queues/${queueId}`);
          const queue = await response.json();
          
          if (queue) {
            addToHistory(queue, qrCodeMessage);
            router.push(`/queue/${queueId}`);
          } else {
            throw new Error("Queue not found");
          }
        }
      } else {
        throw new Error("Invalid QR code format");
      }
    } catch (error) {
      console.error("Invalid QR code:", error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setShowScanner(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 shadow-sm">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Trouver une file d'attente
          </h1>
          <p className="mt-2 text-gray-600">
            Sélectionnez une organisation pour rejoindre leur file
          </p>
        </div>

        <div className="relative flex gap-2">
          <Input
            type="search"
            placeholder="Rechercher une organisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <QueueHistory />
          <QueueStats />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowScanner(true)}
            className="shrink-0"
          >
            <QrCodeIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {locationError && (
        <div className="mx-4">
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">{locationError}</p>
          </div>
        </div>
      )}

      <div className="px-4">
        <QueueSuggestions />
      </div>

      <div className="px-4">
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListBulletIcon className="h-5 w-5" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Carte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Chargement des organisations...</p>
              </div>
            ) : filteredOrganizations.length > 0 ? (
              <div className="grid gap-4">
                {filteredOrganizations.map((org) => (
                  <Card
                    key={org.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <MapPinIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{org.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {org.address}
                        </p>
                        {org.queues && org.queues.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <QueueListIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {org.queues.length} file
                              {org.queues.length > 1 ? "s" : ""} disponible
                              {org.queues.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/organization/${org.id}`)}
                      >
                        Voir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune organisation trouvée</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <QueueMap organizations={filteredOrganizations} />
          </TabsContent>
        </Tabs>
      </div>

      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={(queueId) => {
            setShowScanner(false);
            router.push(`/queue/${queueId}`);
          }}
        />
      )}
    </div>
  );
}
