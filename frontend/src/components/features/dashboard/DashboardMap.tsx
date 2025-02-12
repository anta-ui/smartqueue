import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OrganizationLocation } from "@/types/dashboard";
import L from "leaflet";

// Fix pour les icônes Leaflet en Next.js
const icon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DashboardMapProps {
  locations: OrganizationLocation[];
  onLocationClick?: (location: OrganizationLocation) => void;
}

export default function DashboardMap({
  locations,
  onLocationClick,
}: DashboardMapProps) {
  // Calculer le centre de la carte basé sur les emplacements
  const center = useMemo(() => {
    if (!locations.length) return [0, 0];
    const lats = locations.map((loc) => loc.latitude);
    const lngs = locations.map((loc) => loc.longitude);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [locations]);

  return (
    <MapContainer
      center={[center[0], center[1]]}
      zoom={4}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
          icon={icon}
          eventHandlers={{
            click: () => onLocationClick?.(location),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium">{location.name}</h3>
              <p className="text-sm text-gray-600">
                {location.metrics.users} utilisateurs
              </p>
              <p className="text-sm text-gray-600">
                {location.metrics.requests} requêtes/min
              </p>
              <p
                className={`text-sm ${
                  location.status === "active"
                    ? "text-green-600"
                    : location.status === "inactive"
                    ? "text-gray-600"
                    : "text-red-600"
                }`}
              >
                {location.status === "active"
                  ? "Actif"
                  : location.status === "inactive"
                  ? "Inactif"
                  : "Suspendu"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
