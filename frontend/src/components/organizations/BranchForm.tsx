'use client';

import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { branchService, Branch } from '@/services/api/branchService';

// Définition des interfaces
export interface BranchFormData {
  name: string;
  code: string;
  address?: string;
  city: string;
  country: string;
  is_active?: boolean;
}

export interface BranchUpdateData extends BranchFormData {
  organization: number; // Changer en number explicitement
}

interface BranchFormProps {
  branch?: Branch;
  organizationId: string | number;
  onSuccess: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function BranchForm({ 
  branch, 
  organizationId, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: BranchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Typage correct des valeurs par défaut du formulaire
  const defaultValues: Partial<BranchFormData> = isEditing && branch 
    ? {
        name: branch.name,
        code: branch.code,
        address: branch.address,
        city: branch.city,
        country: branch.country,
        is_active: branch.is_active
      }
    : {
        name: '',
        code: '',
        address: '',
        city: '',
        country: '',
        is_active: true
      };

  const { control, handleSubmit, formState: { errors } } = useForm<BranchFormData>({
    defaultValues
  });
  
  const onSubmit: SubmitHandler<BranchFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      
      console.log("Type et valeur de organizationId:", typeof organizationId, organizationId);
      
      // Vérification améliorée
      if (!organizationId) {
        toast({
          title: 'Erreur',
          description: 'Aucune organisation sélectionnée',
          variant: 'destructive'
        });
        return;
      }
      
      // Si l'ID est 'new', on ne peut pas créer de branche
      if (organizationId === 'new') {
        toast({
          title: 'Erreur',
          description: 'Veuillez d\'abord créer l\'organisation',
          variant: 'destructive'
        });
        return;
      }
      
      // Conversion forcée en nombre
      let orgId: number;
      
      if (typeof organizationId === 'string') {
        orgId = parseInt(organizationId, 10);
        if (isNaN(orgId)) {
          toast({
            title: 'Erreur',
            description: 'ID d\'organisation invalide',
            variant: 'destructive'
          });
          return;
        }
      } else {
        orgId = organizationId as number;
      }
      
      console.log("ID d'organisation après conversion:", orgId, typeof orgId);
      
      const branchData: BranchUpdateData = {
        ...data,
        organization: orgId
      };
      
      console.log('Données envoyées au serveur:', branchData);
      
      if (isEditing && branch) {
        await branchService.update(branch.id, branchData);
      } else {
        await branchService.create(branchData);
      }
      
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erreur de soumission:', error);
        
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de créer la branche',
          variant: 'destructive'
        });
      } else {
        console.error('Erreur de type inconnu:', error);
        
        toast({
          title: 'Erreur',
          description: 'Une erreur inattendue est survenue',
          variant: 'destructive'
        });
      }
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
          rules={{ required: 'Le nom est obligatoire' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <Input {...field} placeholder="Nom de la branche" />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="code"
          control={control}
          rules={{ required: 'Le code est obligatoire' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <Input {...field} placeholder="Code unique" />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <Textarea {...field} placeholder="Adresse complète" />
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="city"
            control={control}
            rules={{ required: 'La ville est obligatoire' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">Ville</label>
                <Input {...field} placeholder="Ville" />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="country"
            control={control}
            rules={{ required: 'Le pays est obligatoire' }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">Pays</label>
                <Input {...field} placeholder="Pays" />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Active</label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (isEditing ? 'Modification...' : 'Création...') 
            : (isEditing ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}