"use client";

import { useEffect, useRef, useState } from "react";
import { Map, Marker, Popup } from "maplibre-gl";
import { useTheme } from "next-themes";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import type { OrganizationLocation } from "@/types/dashboard";

interface OrganizationsMapProps {
  organizations: OrganizationLocation[];
  onOrganizationClick?: (org: OrganizationLocation) => void;
  className?: string;
}

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  suspended: "bg-red-500",
};

export function OrganizationsMap({
  organizations,
  onOrganizationClick,
  className,
}: OrganizationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationLocation | null>(null);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new Map({
      container: mapContainer.current,
      style: theme === "dark"
        ? "https://api.maptiler.com/maps/nights/style.json"
        : "https://api.maptiler.com/maps/streets/style.json",
      center: [0, 20],
      zoom: 2,
    });

    // Add markers
    organizations.forEach((org) => {
      const el = document.createElement("div");
      el.className = "w-4 h-4 rounded-full cursor-pointer transform transition-transform hover:scale-125";
      el.classList.add(statusColors[org.status]);

      const marker = new Marker(el)
        .setLngLat([org.longitude, org.latitude])
        .addTo(map.current!);

      marker.getElement().addEventListener("click", () => {
        setSelectedOrg(org);
        if (onOrganizationClick) {
          onOrganizationClick(org);
        }
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [organizations, theme]);

  return (
    <Card className={className}>
      <div className="relative w-full h-[500px]">
        <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
        
        {selectedOrg && (
          <div className="absolute bottom-4 left-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{selectedOrg.name}</h3>
              <Badge variant={selectedOrg.status as any}>
                {selectedOrg.status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Users</span>
                <span className="font-medium">{selectedOrg.metrics.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requests</span>
                <span className="font-medium">{selectedOrg.metrics.requests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Error Rate</span>
                <span className="font-medium">{selectedOrg.metrics.errorRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime</span>
                <span className="font-medium">{selectedOrg.metrics.uptime.toFixed(2)}%</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrg(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => router.push(`/organizations/${selectedOrg.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
