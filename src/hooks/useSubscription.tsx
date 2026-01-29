import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type SubscriptionPlan = 'free' | 'pro' | 'annual';

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  adjustmentsUsed: number;
  adjustmentsLimit: number;
  canMakeAdjustment: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Stripe price IDs
export const STRIPE_PRICES = {
  pro_monthly: "price_1SuxadEvgf99HIdqAdmSo2NC",
  pro_annual: "price_1SuxazEvgf99HIdqFJu3UNqf",
} as const;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustmentsUsed, setAdjustmentsUsed] = useState(0);
  const [adjustmentsLimit, setAdjustmentsLimit] = useState(3);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setPlan(data.plan || 'free');
      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);

      // Also fetch profile for adjustments info
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('adjustments_used, adjustments_limit, plan')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setAdjustmentsUsed(profile.adjustments_used);
          setAdjustmentsLimit(profile.adjustments_limit);
          setPlan(profile.plan as SubscriptionPlan);
        }
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, user]);

  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user, session, checkSubscription]);

  // Check subscription every minute
  useEffect(() => {
    if (!user || !session) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, session, checkSubscription]);

  const openCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      toast.error('Você precisa estar logado para assinar');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Portal error:', err);
      toast.error('Erro ao abrir portal. Tente novamente.');
    }
  };

  const canMakeAdjustment = plan !== 'free' || adjustmentsUsed < adjustmentsLimit;

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        subscribed,
        subscriptionEnd,
        loading,
        adjustmentsUsed,
        adjustmentsLimit,
        canMakeAdjustment,
        checkSubscription,
        openCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
