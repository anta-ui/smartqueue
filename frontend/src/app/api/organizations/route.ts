import { NextResponse } from 'next/server';

export async function GET() {
  const organizationLocations = [
    {
      id: '1',
      name: 'Entreprise Alpha',
      latitude: 48.8566, // Paris
      longitude: 2.3522,
      activeUsers: 250,
      status: 'active'
    },
    {
      id: '2', 
      name: 'Entreprise Beta',
      latitude: 40.7128, // New York
      longitude: -74.0060,
      activeUsers: 180,
      status: 'limited'
    },
    {
      id: '3',
      name: 'Entreprise Gamma',
      latitude: 35.6762, // Tokyo
      longitude: 139.6503,
      activeUsers: 120,
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Entreprise Delta',
      latitude: -33.8688, // Sydney
      longitude: 151.2093,
      activeUsers: 90,
      status: 'active'
    },
    {
      id: '5',
      name: 'Entreprise Epsilon',
      latitude: 55.7558, // Moscou
      longitude: 37.6173,
      activeUsers: 75,
      status: 'degraded'
    }
  ];

  return NextResponse.json(organizationLocations);
}