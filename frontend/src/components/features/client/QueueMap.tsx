"use client";

import { useState, useEffect, useRef } from "react";
import { Map, Marker, NavigationControl } from "react-map-gl";
import type { Organization } from "@/types/queue";

interface QueueMapProps {
  organizations: Organization[];
  userLocation: { latitude: number; longitude: number } | null;
  onOrganizationSelect: (org: Organization) => void;
  selectedOrganization?: Organization;
}

export function QueueMap({
  organizations,
  userLocation,
  onOrganizationSelect,
  selectedOrganization,
}: QueueMapProps) {
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    latitude: userLocation?.latitude || 0,
    longitude: userLocation?.longitude || 0,
    zoom: 13,
  });

  useEffect(() => {
    if (userLocation) {
      setViewport({
        ...viewport,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }
  }, [userLocation]);

  const handleMarkerClick = (org: Organization) => {
    onOrganizationSelect(org);
    setViewport({
      ...viewport,
      latitude: org.latitude,
      longitude: org.longitude,
      zoom: 15,
    });
  };

  return (
    <div className="h-[50vh] md:h-[60vh] relative rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {/* Marqueur de l'utilisateur */}
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor="center"
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-animation" />
          </Marker>
        )}

        {/* Marqueurs des organisations */}
        {organizations.map((org) => (
          <Marker
            key={org.id}
            latitude={org.latitude}
            longitude={org.longitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(org)}
          >
            <div
              className={`transform -translate-y-1/2 ${
                selectedOrganization?.id === org.id
                  ? "scale-110"
                  : "hover:scale-105"
              } transition-transform cursor-pointer`}
            >
              <div
                className={`p-2 rounded-full ${
                  selectedOrganization?.id === org.id
                    ? "bg-indigo-100"
                    : "bg-white"
                } shadow-md`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    selectedOrganization?.id === org.id
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {org.queues.reduce(
                    (total, queue) => total + queue.currentLength,
                    0
                  )}
                </div>
              </div>
              {selectedOrganization?.id === org.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg p-2 whitespace-nowrap">
                  <p className="text-sm font-medium">{org.name}</p>
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
