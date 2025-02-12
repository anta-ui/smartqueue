import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { notificationService } from '@/services/notification';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkPermission = async () => {
      if (!('Notification' in window)) {
        setLoading(false);
        return;
      }

      setPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
      setLoading(false);
    };

    checkPermission();
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications non supportées',
        description: 'Votre navigateur ne supporte pas les notifications push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setLoading(true);
      const result = await notificationService.requestPushPermission();
      setPermission(result);

      if (result === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez désormais des notifications push.',
        });
        return true;
      } else {
        toast({
          title: 'Notifications refusées',
          description: 'Vous ne recevrez pas de notifications push.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer les notifications push.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      await subscription.unsubscribe();
      await notificationService.unregisterPushSubscription(subscription.endpoint);
      setSubscription(null);
      
      toast({
        title: 'Notifications désactivées',
        description: 'Vous ne recevrez plus de notifications push.',
      });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de désactiver les notifications push.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    subscription,
    loading,
    requestPermission,
    unsubscribe,
    supported: 'Notification' in window,
  };
}
