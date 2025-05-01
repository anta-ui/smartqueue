// src/app/api/usage/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usageData = [
      { date: '2024-01', value: 150 },
      { date: '2024-02', value: 180 },
      { date: '2024-03', value: 210 }
    ];
    
    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'utilisation' },
      { status: 500 }
    );
  }
}
