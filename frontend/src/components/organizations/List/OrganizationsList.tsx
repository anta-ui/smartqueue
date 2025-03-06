// src/components/superAdmin/organizations/OrganizationsList.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Edit } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function OrganizationsList() {
  const router = useRouter();
  const { organizations, loading, error } = useOrganizations();
  
  console.log("OrganizationsList render:", { organizations, loading, error });

  const handleCreateNew = () => {
    router.push('/super-admin/organizations/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Organisation
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations && organizations.length > 0 ? (
          organizations.map(org => (
            <Card key={org.id} className="overflow-hidden shadow hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{org.name}</h3>
                  <Badge className={getStatusBadgeClass(org.status)}>
                    {org.status === 'active' ? 'Actif' : 
                     org.status === 'inactive' ? 'Inactif' : 'En attente'}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plan:</span>
                    <span>{org.plan === 'free' ? 'Gratuit' : 
                           org.plan === 'basic' ? 'Basic' : 'Premium'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pays:</span>
                    <span>{org.country}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
                  >
                    Détails
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => router.push(`/super-admin/organizations/${org.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Aucune organisation trouvée
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};