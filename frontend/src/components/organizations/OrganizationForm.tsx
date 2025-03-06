'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { organizationService } from '@/services/api/organizationService';
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
import { CountrySelect } from '@/components/ui/country-select';

// Définition précise du type pour les données du formulaire
export interface OrganizationFormData {
  name: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive' | 'pending';
  country: string;
}

interface OrganizationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OrganizationForm({ onClose, onSuccess }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<OrganizationFormData>({
    defaultValues: {
      name: '',
      plan: 'premium', // Modifié pour correspondre au défaut backend
      status: 'active',
      country: 'FR',
    },
    mode: 'onBlur', // Validation au moment où l'utilisateur quitte un champ
  });

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Données complètes du formulaire:', JSON.stringify(data, null, 2));
      
      // Validation manuelle supplémentaire
      if (!data.name.trim()) {
        throw new Error('Le nom de l\'organisation est requis');
      }

      // Utiliser les données du formulaire en les mappant explicitement
      const payload = {
        name: data.name.trim(),
        plan: data.plan,
        status: data.status,
        country: data.country
      };
      
      console.log('Payload envoyé:', JSON.stringify(payload, null, 2));
      
      const response = await organizationService.create(payload);
      
      toast({
        title: 'Succès',
        description: 'Organisation créée avec succès',
        variant: 'default',
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Erreur complète de création:', error);
      
      // Gestion détaillée des erreurs
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || "Impossible de créer l'organisation";
      
      toast({
        title: 'Erreur de création',
        description: errorMessage,
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
              message: 'Le nom doit contenir au moins 3 caractères',
            },
            maxLength: {
              value: 255,
              message: 'Le nom ne peut pas dépasser 255 caractères',
            },
          }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'organisation</label>
              <Input 
                {...field} 
                placeholder="Entrez le nom de l'organisation" 
                error={errors.name?.message} 
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
          )}
        />

        <Controller
          name="plan"
          control={control}
          rules={{
            validate: value => 
              ['basic', 'premium'].includes(value) || 'Plan invalide'
          }}
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
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              {errors.plan && <p className="text-xs text-red-500">{errors.plan.message}</p>}
            </div>
          )}
        />

        <Controller
          name="status"
          control={control}
          rules={{
            validate: value => 
              ['active', 'inactive', 'pending'].includes(value) || 'Statut invalide'
          }}
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
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
          )}
        />

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Pays</label>
              <CountrySelect 
                value={field.value} 
                onChange={field.onChange} 
                placeholder="Sélectionnez un pays" 
              />
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