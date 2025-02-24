'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { organizationService, type OrganizationFormData } from '@/services/api/organizationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface EditOrganizationFormProps {
  organization: any;
  onClose: () => void;
}

export function EditOrganizationForm({ 
  organization, 
  onClose 
}: EditOrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { control, handleSubmit } = useForm<OrganizationFormData>({
    defaultValues: {
      name: organization.name,
      plan: organization.plan,
      status: organization.status,
      region: organization.region
    }
  });

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      
      // Log pour voir les données avant l'envoi
      console.log('Données du formulaire de modification:', data);
      
      // Appel à une nouvelle méthode de mise à jour
      await organizationService.update(organization.id, data);
      
      toast({
        title: 'Succès',
        description: 'Organisation modifiée avec succès',
      });
      
      onClose();
      router.push('/dashboard/organizations');
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'organisation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{ 
            required: 'Le nom est requis',
            minLength: {
              value: 3,
              message: 'Le nom doit contenir au moins 3 caractères'
            }
          }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'organisation</label>
              <Input 
                {...field}
                placeholder="Entrez le nom de l'organisation"
              />
            </div>
          )}
        />

        <Controller
          name="plan"
          control={control}
          rules={{ required: 'Le plan est requis' }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Région</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">Nord</SelectItem>
                  <SelectItem value="south">Sud</SelectItem>
                  <SelectItem value="east">Est</SelectItem>
                  <SelectItem value="west">Ouest</SelectItem>
                  <SelectItem value="central">Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Modification...' : 'Modifier'}
        </Button>
      </div>
    </form>
  );
}