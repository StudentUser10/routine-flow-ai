import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type AdjustmentSource = 'manual' | 'ai' | 're_onboarding' | 'regenerate';

interface AdjustmentStatus {
  canAdjust: boolean;
  adjustmentsUsed: number;
  adjustmentsLimit: number;
  remaining: number;
  plan: string;
  message: string;
}

export function useAdjustments() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AdjustmentStatus | null>(null);

  const checkAdjustments = useCallback(async (): Promise<AdjustmentStatus | null> => {
    if (!session?.access_token) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('validate-adjustment', {
        body: { action: 'check' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Check adjustments error:', error);
        return null;
      }

      setStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to check adjustments:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const registerAdjustment = useCallback(async (
    source: AdjustmentSource,
    routineId?: string,
    description?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!session?.access_token) {
      toast.error('Você precisa estar logado');
      return { success: false, message: 'Não autorizado' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('validate-adjustment', {
        body: {
          action: 'register',
          source,
          routine_id: routineId,
          description,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Register adjustment error:', error);
        toast.error('Erro ao registrar geração');
        return { success: false, message: 'Erro interno' };
      }

      if (!data.success) {
        toast.error(data.error || 'Limite de gerações atingido');
        return { success: false, message: data.error };
      }

      // Update local status
      setStatus({
        canAdjust: data.canAdjust,
        adjustmentsUsed: data.adjustmentsUsed,
        adjustmentsLimit: data.adjustmentsLimit,
        remaining: data.remaining,
        plan: status?.plan || 'free',
        message: data.message,
      });

      return { success: true, message: data.message };
    } catch (err) {
      console.error('Failed to register adjustment:', err);
      toast.error('Erro ao registrar geração');
      return { success: false, message: 'Erro interno' };
    }
  }, [session?.access_token, status?.plan]);

  const validateAndExecute = useCallback(async <T,>(
    source: AdjustmentSource,
    action: () => Promise<T>,
    routineId?: string,
    description?: string
  ): Promise<{ success: boolean; result?: T; message?: string }> => {
    // First check if user can make adjustment
    const currentStatus = await checkAdjustments();

    if (!currentStatus?.canAdjust) {
      toast.error('Você atingiu o limite de gerações do seu plano. Faça upgrade para Pro.');
      return { 
        success: false, 
        message: 'Limite de gerações atingido' 
      };
    }

    // Execute the action
    try {
      const result = await action();
      
      // Register the adjustment
      const registration = await registerAdjustment(source, routineId, description);
      
      if (!registration.success) {
        // Action executed but registration failed - log this
        console.warn('Action executed but adjustment registration failed');
      }

      return { success: true, result, message: registration.message };
    } catch (err) {
      console.error('Action execution failed:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Erro ao executar ação' 
      };
    }
  }, [checkAdjustments, registerAdjustment]);

  useEffect(() => {
    if (session) {
      checkAdjustments();
    }
  }, [session, checkAdjustments]);

  return {
    loading,
    status,
    canAdjust: status?.canAdjust ?? false,
    adjustmentsUsed: status?.adjustmentsUsed ?? 0,
    adjustmentsLimit: status?.adjustmentsLimit ?? 3,
    remaining: status?.remaining ?? 0,
    checkAdjustments,
    registerAdjustment,
    validateAndExecute,
    refetch: checkAdjustments,
  };
}
