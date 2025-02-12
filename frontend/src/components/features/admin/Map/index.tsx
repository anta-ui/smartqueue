"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Organization {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "inactive";
  size: "small" | "medium" | "large";
}

interface MapComponentProps {
  organizations: Organization[];
  onRegionClick?: (region: string) => void;
}

export default function MapComponent({
  organizations = [],
  onRegionClick,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.3522, 48.8566], // Paris
      zoom: 4,
    });

    // Ajouter les contrôles
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    // Charger les données des régions
    map.current.on("load", () => {
      map.current?.addSource("regions", {
        type: "geojson",
        data: "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson",
      });

      map.current?.addLayer({
        id: "regions-fill",
        type: "fill",
        source: "regions",
        paint: {
          "fill-color": "rgba(99, 102, 241, 0.1)",
          "fill-outline-color": "rgba(99, 102, 241, 0.5)",
        },
      });

      map.current?.addLayer({
        id: "regions-hover",
        type: "fill",
        source: "regions",
        paint: {
          "fill-color": "rgba(99, 102, 241, 0.3)",
        },
        filter: ["==", "code", ""],
      });

      // Gestion du survol
      map.current?.on("mousemove", "regions-fill", (e) => {
        if (e.features && e.features[0]) {
          map.current?.setFilter("regions-hover", [
            "==",
            "code",
            e.features[0].properties?.code,
          ]);
        }
      });

      map.current?.on("mouseleave", "regions-fill", () => {
        map.current?.setFilter("regions-hover", ["==", "code", ""]);
      });

      // Gestion du clic
      map.current?.on("click", "regions-fill", (e) => {
        if (e.features && e.features[0] && onRegionClick) {
          onRegionClick(e.features[0].properties?.nom);
        }
      });
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, []);

  // Mettre à jour les marqueurs quand les organisations changent
  useEffect(() => {
    if (!map.current) return;

    // Supprimer les anciens marqueurs
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Créer les nouveaux marqueurs
    organizations.forEach((org) => {
      // Créer l'élément personnalisé du marqueur
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.backgroundColor =
        org.status === "active" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      el.style.cursor = "pointer";

      // Ajouter le popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-medium">${org.name}</h3>
          <p class="text-sm text-gray-500">Status: ${org.status}</p>
          <p class="text-sm text-gray-500">Size: ${org.size}</p>
        </div>
      `);

      // Créer et ajouter le marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat([org.longitude, org.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [organizations]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden">
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}
