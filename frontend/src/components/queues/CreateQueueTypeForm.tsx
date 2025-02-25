// src/components/queues/CreateQueueTypeForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

// Importez les services
import { queueTypeService, QueueTypeCategories } from '@/services/queueTypeService';
import { userService } from '@/services/userService';

export function CreateQueueTypeForm({ onSuccess, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Configuration du formulaire
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      category: QueueTypeCategories.PERSON,
      description: '',
      estimated_service_time: 15,
      max_capacity: 100,
      requires_vehicle_info: false,
      requires_identification: false,
      is_active: true,
      organization: '',
      branch: ''
    }
  });

  const selectedOrgId = watch('organization');

  // Charger les organisations au chargement du composant
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);
        const orgs = await userService.getOrganizations();
        
        console.log('Organisations chargées:', orgs);
        setOrganizations(orgs);
        
        // Si une seule organisation est disponible, la sélectionner par défaut
        if (orgs && orgs.length === 1) {
          setValue('organization', orgs[0].id);
          console.log('Organisation par défaut sélectionnée:', orgs[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des organisations', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les organisations',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [setValue]);

  // Charger les branches quand l'organisation change
  useEffect(() => {
    if (!selectedOrgId) {
      setBranches([]);
      setValue('branch', '');
      return;
    }

    const fetchBranches = async () => {
      try {
        setIsLoadingBranches(true);
        // Utiliser le chemin d'API correct basé sur le modèle OrganizationBranch
        const response = await fetch(`/api/organizations/${selectedOrgId}/`);
        const orgData = await response.json();
        
        // Récupérer les branches depuis la propriété 'branches'
        const branchList = orgData.branches || [];
        console.log(`Branches récupérées pour l'organisation ${selectedOrgId}:`, branchList);
        
        if (branchList.length === 0) {
          // Essayer une autre approche
          try {
            const branchResponse = await fetch(`/api/core/organization-branches/?organization=${selectedOrgId}`);
            const branchData = await branchResponse.json();
            console.log('Branches via API alternative:', branchData);
            setBranches(branchData);
            
            if (branchData.length > 0) {
              setValue('branch', branchData[0].id);
            }
          } catch (branchError) {
            console.error('Erreur lors de la récupération des branches via API alternative:', branchError);
            // Dernière tentative - utiliser une branche avec ID 1
            setBranches([{ id: '1', name: 'Branche principale (ID fixe)' }]);
            setValue('branch', '1');
          }
        } else {
          setBranches(branchList);
          if (branchList.length > 0) {
            setValue('branch', branchList[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des branches', error);
        // Valeur de secours - utiliser ID 1 comme branche par défaut
        setBranches([{ id: '1', name: 'Branche principale (valeur par défaut)' }]);
        setValue('branch', '1');
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [selectedOrgId, setValue]);

  // Mode de saisie manuelle
  const [manualEntry, setManualEntry] = useState(false);
  
  // Activer la saisie manuelle des IDs
  const activateManualEntry = () => {
    setManualEntry(true);
    toast({
      title: 'Mode manuel activé',
      description: 'Vous pouvez maintenant saisir manuellement l\'ID de branche',
    });
  };

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      console.log('Données du formulaire à envoyer:', data);
      
      // Création du type de file d'attente
      const newQueueType = await queueTypeService.createQueueType(data);

      // Notifications et actions post-création
      toast({
        title: 'Succès',
        description: `Type de file d'attente "${newQueueType.name}" créé`,
        variant: 'default'
      });

      // Réinitialisation du formulaire
      reset();

      // Appel du callback de succès si fourni
      onSuccess && onSuccess();
    } catch (error) {
      // Gestion des erreurs
      let errorMessage = 'Impossible de créer le type de file d\'attente';
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        
        if (typeof serverErrors === 'object' && Object.keys(serverErrors).length > 0) {
          errorMessage += ': ' + Object.entries(serverErrors)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join(', ');
            
          // Si l'erreur concerne la branche, activer le mode manuel
          if (serverErrors.branch) {
            setManualEntry(true);
          }
        }
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
      
      console.error('Erreur de création:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Créer un Nouveau Type de File d'Attente</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Organisation */}
        <div>
          <label className="block mb-2">Organisation</label>
          <Controller
            name="organization"
            control={control}
            rules={{ required: 'L\'organisation est obligatoire' }}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled={isLoadingOrgs || organizations.length === 0}
              >
                <SelectTrigger>
                  {isLoadingOrgs ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : (
                    <SelectValue placeholder="Sélectionner une organisation" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {organizations.length === 0 && !isLoadingOrgs ? (
                    <SelectItem value="none" disabled>
                      Aucune organisation disponible
                    </SelectItem>
                  ) : (
                    organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.organization && (
            <p className="text-red-500 text-sm mt-1">
              {errors.organization.message}
            </p>
          )}
        </div>

        {/* Branche - sélecteur ou saisie manuelle */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label>Branche</label>
            {!manualEntry && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={activateManualEntry}
              >
                Saisie manuelle
              </Button>
            )}
          </div>
          
          {manualEntry ? (
            <Controller
              name="branch"
              control={control}
              rules={{ required: 'L\'ID de branche est obligatoire' }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Saisissez l'ID de la branche (ex: 1)"
                  type="text"
                />
              )}
            />
          ) : (
            <Controller
              name="branch"
              control={control}
              rules={{ required: 'La branche est obligatoire' }}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isLoadingBranches || branches.length === 0 || !selectedOrgId}
                >
                  <SelectTrigger>
                    {isLoadingBranches ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </div>
                    ) : (
                      <SelectValue placeholder="Sélectionner une branche" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length === 0 || !selectedOrgId ? (
                      <SelectItem value="none" disabled>
                        {!selectedOrgId ? 'Sélectionnez d\'abord une organisation' : 'Aucune branche disponible'}
                      </SelectItem>
                    ) : (
                      branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name || `Branche ${branch.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.branch && (
            <p className="text-red-500 text-sm mt-1">
              {errors.branch.message}
            </p>
          )}
          
          {/* Message d'aide */}
          {manualEntry && (
            <p className="text-xs text-gray-500 mt-1">
              Essayez "1" si vous ne connaissez pas l'ID exact de la branche.
            </p>
          )}
        </div>

        {/* Nom du type de file d'attente */}
        <div>
          <label className="block mb-2">Nom du Type</label>
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
                placeholder="Ex: Service Clients Standard"
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

        {/* Catégorie */}
        <div>
          <label className="block mb-2">Catégorie</label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'La catégorie est obligatoire' }}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QueueTypeCategories.PERSON}>Personne</SelectItem>
                  <SelectItem value={QueueTypeCategories.VEHICLE}>Véhicule</SelectItem>
                  <SelectItem value={QueueTypeCategories.MIXED}>Mixte</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea 
                {...field} 
                placeholder="Description du type de file d'attente"
                rows={3}
              />
            )}
          />
        </div>

        {/* Temps de service estimé */}
        <div>
          <label className="block mb-2">Temps de Service Estimé (minutes)</label>
          <Controller
            name="estimated_service_time"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                type="number"
                placeholder="15"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </div>

        {/* Capacité maximale */}
        <div>
          <label className="block mb-2">Capacité Maximale</label>
          <Controller
            name="max_capacity"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                type="number"
                placeholder="100"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </div>

        {/* Options spécifiques */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Nécessite des informations de véhicule</label>
            <Controller
              name="requires_vehicle_info"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label>Nécessite une identification</label>
            <Controller
              name="requires_identification"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label>Actif</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
          </div>
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
            disabled={isLoading || !selectedOrgId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : 'Créer le Type de File d\'Attente'}
          </Button>
        </div>
      </form>
    </div>
  );
}