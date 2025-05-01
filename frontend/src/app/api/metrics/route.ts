import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Données statiques pour test
    const metrics = {
      activeOrgs: 150,
      mrr: 25000,
      systemUsage: 75,
      systemHealth: 98
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
}
