import { NextRequest, NextResponse } from 'next/server'
import { organizationService } from '@/services/api/organizationService';
import axios from 'axios';
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    // Utiliser la méthode du service
    await organizationService.delete(id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'organisation" },
      { status: 500 }
    )
  }
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization');
  console.log('Token présent:', !!authHeader);

  try {
      // **IMPORTANT: Await the params!**
      const id = params.id;
      console.log(`Tentative de récupération de l'organisation avec l'ID: ${id}`);

      const organization = await organizationService.getById(id);

      if (!organization) {
          return new NextResponse(JSON.stringify({ message: 'Organisation non trouvée' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
          });
      }

      return NextResponse.json(organization);

  } catch (error) {
      console.error('Erreur détaillée lors de la récupération de l\'organisation:', error);

      let status = 500;
      let message = 'Erreur interne du serveur';

      if (axios.isAxiosError(error) && error.response?.status === 401) {
          status = 401;
          message = 'Non autorisé';
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
          status = 404;
          message = 'Organisation non trouvée';
      }

      return new NextResponse(
          JSON.stringify({ message: message, details: error.message }),
          {
              status: status,
              headers: { 'Content-Type': 'application/json' },
          }
      );
  }
}