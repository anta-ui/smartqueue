import { NextRequest, NextResponse } from 'next/server'
import api from '@/services/api'
import { deleteOrganization } from '@/services/api/organizationService'
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Votre logique de suppression (base de données, service, etc.)
    // Par exemple :
    await deleteOrganization(id)

    return NextResponse.json({ message: "Organisation supprimée" }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'organisation" }, 
      { status: 500 }
    )
  }
}