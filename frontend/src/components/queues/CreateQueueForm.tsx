// src/components/queues/CreateQueueForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { queueService } from '@/services/queueService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

// Interface pour les types de files d'attente
interface QueueType {
  id: string;
  name: string;
  category: 'VE' | 'PE' | 'MI';
}

// Interface pour les données du formulaire
interface QueueFormData {
  name: string;
  queue_type: string;
  status: 'AC' | 'PA' | 'CL' | 'MA';
  current_number?: number;
  current_wait_time?: number;
  is_priority?: boolean;
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
  const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Configuration du formulaire
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm<QueueFormData>({
    defaultValues: {
      name: '',
      queue_type: '',
      status: 'AC',
      current_number: 0,
      current_wait_time: 0,
      is_priority: false
    }
  });

  // Charger les types de files d'attente
  useEffect(() => {
    const fetchQueueTypes = async () => {
      try {
        setIsLoading(true);
        setFetchError(null); // Réinitialiser l'erreur
        
        const types = await queueService.getQueueTypes();
        
        if (Array.isArray(types)) {
          if (types.length === 0) {
            console.log('Aucun type de file trouvé dans la base de données');
            setFetchError('Aucun type de file n\'est configuré dans le système');
          } else {
            console.log('Types de files récupérés:', types);
            setQueueTypes(types);
          }
        } else {
          console.error('La réponse n\'est pas un tableau:', types);
          setFetchError('Format de réponse incorrect');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des types:', error);
        setFetchError('Impossible de charger les types de files');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchQueueTypes();
  }, []);

  // Ajoutez un log pour suivre l'état des types de files
  useEffect(() => {
    console.log('État actuel des types de files:', queueTypes);
  }, [queueTypes]);

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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Créer une Nouvelle File d'Attente</h2>
      
      {/* Affichage des erreurs de chargement */}
      {fetchError && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{fetchError}</p>
        </div>
      )}

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

        {/* Type de file d'attente */}
        <div>
          <label className="block mb-2">Type de File d'Attente</label>
          <Controller
            name="queue_type"
            control={control}
            rules={{ required: 'Le type de file est obligatoire' }}
            render={({ field }) => (
              <Select 
                value={field.value || 'default'} 
                onValueChange={(value) => {
                  // Ne pas accepter la valeur 'default'
                  if (value !== 'default') {
                    field.onChange(value);
                  }
                }}
                      >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de file" />
              </SelectTrigger>
              <SelectContent>
                {queueTypes.length === 0 ? (
                  <SelectItem value="default" disabled>
                    Aucun type de file disponible
                  </SelectItem>
                ) : (
                  queueTypes.map(type => (
                    <SelectItem 
                      key={type.id} 
                      value={type.id}
                    >
                      {type.name} ({
                        type.category === 'VE' ? 'Véhicule' : 
                        type.category === 'PE' ? 'Personne' : 'Mixte'
                      })
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
          
        </div>

        {/* Statut de la file d'attente */}
        <div>
          <label className="block mb-2">Statut</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Actif</SelectItem>
                  <SelectItem value="PA">En Pause</SelectItem>
                  <SelectItem value="CL">Fermé</SelectItem>
                  <SelectItem value="MA">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Numéro actuel et temps d'attente */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Numéro Actuel</label>
            <Controller
              name="current_number"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number"
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
          <div>
            <label className="block mb-2">Temps d'Attente (min)</label>
            <Controller
              name="current_wait_time"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number"
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </div>

        {/* Priorité */}
        <div className="flex items-center justify-between">
          <label>File Prioritaire</label>
          <Controller
            name="is_priority"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 mt-6">
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