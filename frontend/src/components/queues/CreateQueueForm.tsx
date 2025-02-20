// src/components/queue/CreateQueueForm.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { queueService } from '@/services/queueService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// Interface pour les données du formulaire
interface QueueFormData {
  name: string;
  queue_type?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  current_number?: number;
  current_wait_time?: number;
}

// Props du composant
interface CreateQueueFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function CreateQueueForm({ 
  onSuccess, 
  onClose 
}: CreateQueueFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Configuration du formulaire
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm<QueueFormData>({
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      current_number: 0,
      current_wait_time: 0
    }
  });

  // Soumission du formulaire
  const onSubmit = async (data: QueueFormData) => {
    try {
      setIsLoading(true);
      
      // Création de la file d'attente
      const newQueue = await queueService.createQueue(data);

      // Notifications et actions post-création
      toast({
        title: 'Succès',
        description: `File d'attente "${newQueue.name}" créée`,
        variant: 'default'
      });

      // Réinitialisation du formulaire
      reset();

      // Appel du callback de succès si fourni
      onSuccess && onSuccess();
    } catch (error) {
      // Gestion des erreurs
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la file d\'attente',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Créer une Nouvelle File d'Attente</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nom de la file d'attente */}
        <div>
          <label className="block mb-2">Nom de la File d'Attente</label>
          <Controller
            name="name"
            control={control}
            rules={{ 
              required: 'Le nom est obligatoire',
              minLength: {
                value: 3,
                message: 'Le nom doit contenir au moins 3 caractères'
              }
            }}
            render={({ field }) => (
              <Input 
                {...field} 
                placeholder="Ex: Accueil Principal"
                className={errors.name ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Statut de la file d'attente */}
        <div>
          <label className="block mb-2">Statut</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex space-x-4">
                {(['ACTIVE', 'PAUSED', 'CLOSED'] as const).map(status => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      {...field}
                      value={status}
                      checked={field.value === status}
                      className="form-radio"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          {onClose && (
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
            >
              Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Création en cours...' : 'Créer la File d\'Attente'}
          </Button>
        </div>
      </form>
    </div>
  );
}