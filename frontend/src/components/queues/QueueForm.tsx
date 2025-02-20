// src/components/queue/QueueForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { QueueCreateUpdateData, Queue } from '@/types/queue';

interface QueueFormProps {
  queue?: Queue | null;
  queueTypes: any[];
  onSubmit: (data: QueueCreateUpdateData) => Promise<void>;
  onClose: () => void;
}

export function QueueForm({ 
  queue, 
  queueTypes, 
  onSubmit, 
  onClose 
}: QueueFormProps) {
  const { control, handleSubmit, reset } = useForm<QueueCreateUpdateData>({
    defaultValues: queue ? {
      name: queue.name,
      queue_type: queue.queue_type,
      status: queue.status,
      current_number: queue.current_number,
      current_wait_time: queue.current_wait_time,
    } : {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (data: QueueCreateUpdateData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
    } catch (error) {
      // Gérer les erreurs
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {queue ? 'Modifier la File d\'Attente' : 'Nouvelle File d\'Attente'}
      </h2>

      <Controller
        name="name"
        control={control}
        rules={{ required: 'Le nom est requis' }}
        render={({ field, fieldState }) => (
          <div>
            <label>Nom de la File d'Attente</label>
            <Input 
              {...field} 
              placeholder="Nom de la file d'attente"
            />
            {fieldState.error && (
              <p className="text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="queue_type"
        control={control}
        rules={{ required: 'Le type de file est requis' }}
        render={({ field, fieldState }) => (
          <div>
            <label>Type de File</label>
            <Select
              {...field}
              options={queueTypes.map(type => ({
                value: type.id,
                label: type.name
              }))}
              placeholder="Sélectionner un type de file"
            />
            {fieldState.error && (
              <p className="text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {queue ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}