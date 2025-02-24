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

interface OrganizationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function OrganizationForm({ onClose, onSuccess }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit } = useForm<OrganizationFormData>({
    defaultValues: {
      name: '',
      plan: 'free',
      status: 'active',
      region: 'central'
    }
  });

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Données du formulaire:', data);
      
      await organizationService.create(data);
      
      toast({
        title: 'Succès',
        description: 'Organisation créée avec succès',
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'organisation',
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
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le plan" />
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
          {isSubmitting ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}