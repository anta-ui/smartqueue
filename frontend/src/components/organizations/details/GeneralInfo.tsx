// src/components/organizations/details/GeneralInfo.tsx
'use client';
import { fr as frLocale } from 'date-fns/locale';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Clock,
  ExternalLink,
  FileText,
  Download,
  Upload,
  Plus,
  PencilIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { organizationService } from '@/services/api/organizationService';
// Importez votre composant CountrySelect
import { CountrySelect } from '@/components/ui/country-select';
import { getCountryDisplayName } from '@/utils/countries';

import { 
  getOrganizationContacts,
  getOrganizationDocuments,
  getOrganizationHistory,
  uploadOrganizationDocument,
  addOrganizationContact
} from '@/utils/apiHelpers';

import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { SimpleSpinner } from '@/components/ui/spinner';
import { Spinner } from '@/components/ui/spinner';
import { getName } from 'country-list'; // Importez directement depuis country-list

// Interfaces
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'pending';
  plan:'basic' | 'premium';
  website?: string;
  industry?: string;
  foundedYear?: string;
  country?: string; 
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email: string;
  phone?: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ChangeHistoryItem {
  id: string;
  action: string;
  from?: string;
  to?: string;
  date: string;
  by: string;
}

interface GeneralInfoProps {
  organizationId: number;
}

// Fonction pour formater le statut
const formatStatus = (status: string | boolean) => {
  // Si c'est un booléen (is_active), le convertir en chaîne
  if (typeof status === 'boolean') {
    status = status ? 'active' : 'inactive';
  }
  
  const statusMap: Record<string, { label: string, variant: "default" | "destructive" | "outline" | "secondary" }> = {
    'active': { label: 'Actif', variant: "default" },
    'inactive': { label: 'Inactif', variant: "secondary" },
    'suspended': { label: 'Suspendu', variant: "destructive" },
    'pending': { label: 'En attente', variant: "outline" },
    'true': { label: 'Actif', variant: "default" },
    'false': { label: 'Inactif', variant: "secondary" },
  };

  const statusInfo = statusMap[String(status).toLowerCase()] || 
    { label: String(status) || 'Non défini', variant: "secondary" };
  
  return (
    <Badge variant={statusInfo.variant}>
      {statusInfo.label}
    </Badge>
  );
};

export function GeneralInfo({ organizationId }: GeneralInfoProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!organizationId) return;
      
      try {
        const response = await superAdminService.getOrganizationDetails(organizationId);
        
        if (isMounted) {
          setData(response);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        
        if (isMounted) {
          setError(`Erreur lors du chargement des données: ${err.message}`);
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Nettoyage pour éviter les fuites de mémoire
    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  // Fonction pour gérer le clic sur le bouton Modifier
  const handleEditClick = () => {
    alert("Cette fonctionnalité sera disponible prochainement. Le pays est défini lors de la création de l'organisation mais n'est pas renvoyé par l'API.");
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Nom</p>
              <p>{data.name || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="capitalize">{data.plan || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Statut</p>
              <div>
                <Badge variant={data.is_active ? "default" : "secondary"}>
                  {data.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Pays</p>
              <div className="flex items-center">
                <p className="text-amber-600">
                  Donnée non disponible dans l'API
                </p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-6 w-6" 
                  onClick={handleEditClick}
                  type="button"
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Date de création</p>
              <p>{data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Nombre d'utilisateurs</p>
              <p>{data.user_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {data.subscription_status && (
        <Card>
          <CardHeader>
            <CardTitle>Informations d'abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium">Type d'abonnement</p>
                <p className="capitalize">{data.subscription_status.type || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Statut</p>
                <Badge variant={data.subscription_status.is_active ? "default" : "secondary"}>
                  {data.subscription_status.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            
            {data.subscription_status.features && data.subscription_status.features.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Fonctionnalités incluses</p>
                <div className="grid grid-cols-2 gap-2">
                  {data.subscription_status.features.map((feature: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${feature.included ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}