// src/components/organizations/list/QuickActions.jsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Pause,
  Play,
  UserPlus,
  UploadCloud,
  Mail,
  Phone,
  MoreHorizontal,
  Star,
  Shield,
  AlertTriangle,
  Check,
  Ban
} from 'lucide-react';

export function QuickActions({ organization, onStatusChange, onRefresh }) {
  const { toast } = useToast();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gérer le changement de statut (Activer/Suspendre)
  const handleStatusChange = async (newStatus) => {
    try {
      setIsSubmitting(true);
      // Dans une application réelle, vous appelleriez une API ici
      // Simulation d'un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: newStatus === 'active' ? "Organisation activée" : "Organisation suspendue",
        description: newStatus === 'active' 
          ? `${organization.name} a été activée avec succès.`
          : `${organization.name} a été suspendue.`,
        variant: newStatus === 'active' ? "default" : "destructive"
      });
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      // Fermer la boîte de dialogue si nécessaire
      if (newStatus === 'inactive') {
        setIsSuspendDialogOpen(false);
      }
      
      // Rafraîchir les données si nécessaire
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Erreur lors du changement de statut:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'organisation.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Envoyer un message au contact principal
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Simuler un appel API pour envoyer le message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message envoyé",
        description: `Votre message a été envoyé à ${organization.name}.`,
      });
      
      setIsContactDialogOpen(false);
      setContactForm({ subject: '', message: '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mettre à jour le plan
  const handleUpgradePlan = async (newPlan) => {
    try {
      // Simuler un appel API pour mettre à jour le plan
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Plan mis à jour",
        description: `Le plan de ${organization.name} a été mis à jour vers ${newPlan}.`,
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Actions Rapides</CardTitle>
        <CardDescription>Gérer rapidement cette organisation</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          {/* Action: Activer/Suspendre l'organisation */}
          {organization.status === 'inactive' ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleStatusChange('active')}
                  >
                    <Play className="h-4 w-4 mr-2 text-green-600" />
                    Activer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réactiver l'organisation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Pause className="h-4 w-4 mr-2 text-amber-600" />
                  Suspendre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspendre l'organisation</DialogTitle>
                  <DialogDescription>
                    Cette action suspendra tous les services pour {organization.name}.
                    Les utilisateurs ne pourront plus accéder à leur compte.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label htmlFor="reason" className="block text-sm font-medium mb-2">
                    Raison de la suspension
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="Veuillez indiquer la raison de la suspension..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSuspendDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusChange('inactive')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Suspension...' : 'Confirmer la suspension'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Action: Contacter */}
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                Contacter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contacter l'organisation</DialogTitle>
                <DialogDescription>
                  Envoyer un message à l'administrateur de {organization.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendMessage} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Sujet
                  </label>
                  <Input
                    id="subject"
                    placeholder="Sujet du message"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({...prev, subject: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Votre message..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                    rows={4}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsContactDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Action: Ajouter un membre */}
          <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/organizations/${organization.id}/members/add`)}>
            <UserPlus className="h-4 w-4 mr-2 text-violet-600" />
            Membres
          </Button>
          
          {/* Menu déroulant pour les options avancées */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Plus
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions avancées</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Mettre à jour le plan */}
              <DropdownMenuLabel className="text-xs text-gray-500">Changer de plan</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleUpgradePlan('basic')}
                disabled={organization.plan === 'basic'}
              >
                <Star className="h-4 w-4 mr-2 text-blue-500" />
                <span>Passer à Basic</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleUpgradePlan('premium')}
                disabled={organization.plan === 'premium'}
              >
                <Star className="h-4 w-4 mr-2 text-amber-500" />
                <span>Passer à Premium</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Autres actions */}
              <DropdownMenuItem onClick={() => window.open(`tel:${organization.phone || '+33123456789'}`)}>
                <Phone className="h-4 w-4 mr-2 text-green-600" />
                <span>Appeler</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/organizations/${organization.id}/reports`)}>
                <UploadCloud className="h-4 w-4 mr-2 text-cyan-600" />
                <span>Exporter les données</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Action non implémentée",
                    description: "Cette fonctionnalité sera disponible prochainement.",
                    variant: "default"
                  });
                }}
                className="text-amber-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                <span>Permissions spéciales</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Action non implémentée",
                    description: "Cette fonctionnalité sera disponible prochainement.",
                    variant: "default"
                  });
                }}
                className="text-red-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Signaler un problème</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Indicateurs de statut */}
      <CardFooter className="pt-0 pb-4">
        <div className="w-full flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            {organization.status === 'active' ? (
              <span className="flex items-center text-green-600">
                <Check className="h-3 w-3 mr-1" /> Active
              </span>
            ) : organization.status === 'inactive' ? (
              <span className="flex items-center text-gray-600">
                <Ban className="h-3 w-3 mr-1" /> Inactive
              </span>
            ) : (
              <span className="flex items-center text-amber-600">
                <Clock className="h-3 w-3 mr-1" /> En attente
              </span>
            )}
          </div>
          
          <span>
            Plan actuel: <strong>{organization.plan === 'free' ? 'Gratuit' : organization.plan === 'basic' ? 'Basic' : 'Premium'}</strong>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}