// src/app/api/alerts/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alerts = [
      {
        id: '1',
        message: 'Charge système élevée',
        severity: 'warning',
        timestamp: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alerts error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}