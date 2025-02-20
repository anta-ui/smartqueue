'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { OrganizationLocation } from '@/types/dashboard';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MOCK_ORGANIZATIONS: OrganizationLocation[] = [
  // ... vos données d'organisation ici ...
];

const MapWrapper: React.FC<{ organizations: OrganizationLocation[] }> = ({ organizations }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [30, 0],
        zoom: 2,
        worldCopyJump: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      organizations.forEach((org) => {
        L.marker([org.latitude, org.longitude])
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${org.name}</strong><br>
            Utilisateurs actifs : ${org.activeUsers}<br>
            Statut : ${org.status}
          `);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [organizations]);

  return <div id="map" style={{ height: '100%', width: '100%' }} />;
};

export const OrganizationMap: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationLocation[]>([]);
  const [isClient, setIsClient] = useState(false);
  

  useEffect(() => {
    setIsClient(true);
    setOrganizations(MOCK_ORGANIZATIONS);
  }, []);

  if (!isClient) {
    return <div>Chargement de la carte...</div>;
  }

  return (
    <Card className="h-[500px] w-full">
      <CardHeader>
        <h3 className="text-lg font-medium">Organisations Mondiales</h3>
      </CardHeader>
      <CardContent className="h-full">
        <MapWrapper organizations={organizations} />
      </CardContent>
    </Card>
  );
};

export default OrganizationMap;