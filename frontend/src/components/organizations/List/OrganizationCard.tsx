// src/components/organizations/list/OrganizationCard.jsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, Trash2 } from 'lucide-react';

const OrganizationCard = ({ organization }) => {
  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{organization.name}</h3>
          <Badge className={getStatusColor(organization.status)}>
            {organization.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Plan:</span>
            <span className="text-sm font-medium">{organization.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Région:</span>
            <span className="text-sm font-medium">{organization.region || 'Non spécifiée'}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Bouton pour voir les détails */}
          <Link href={`/dashboard/organizations/${organization.id}`} passHref>
            <Button variant="outline" className="w-full">
              Voir les détails
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {/* Boutons pour éditer et supprimer */}
          <div className="flex space-x-2">
            <Link href={`/dashboard/organizations/${organization.id}/edit`} passHref className="flex-1">
              <Button variant="secondary" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationCard;