// app/dashboard/organizations/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { organizationService } from '@/services/api/organizationService';
import { ArrowLeft, Building, Check, Loader2 } from 'lucide-react';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    plan: 'free',
    status: 'active',
    region: 'central'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await organizationService.create(formData);
      toast({
        title: "Succès",
        description: "Organisation créée avec succès",
      });
      router.push('/dashboard/organizations');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'organisation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/organizations')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
      </div>

      <Card className="shadow-md border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informations de l'organisation</CardTitle>
              <CardDescription>Remplissez les détails pour créer une nouvelle organisation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
                Nom de l'organisation <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Entrez le nom de l'organisation"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Ce nom sera visible par tous les membres de l'organisation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="plan" className="text-sm font-medium text-gray-700 block">
                  Plan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleSelectChange('plan', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700 block">
                  Statut <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-medium text-gray-700 block">
                Région <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleSelectChange('region', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une région" />
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

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/organizations')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Créer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}