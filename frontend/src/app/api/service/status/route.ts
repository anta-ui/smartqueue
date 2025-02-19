// src/app/api/service/status/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      api: 'healthy',
      websocket: 'healthy',
      thirdParty: 'degraded'
    });
  } catch (error) {
    console.error('Service status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut des services' },
      { status: 500 }
    );
  }
}