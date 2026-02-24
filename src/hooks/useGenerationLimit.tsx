import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const FREE_PLAN_MONTHLY_LIMIT = 3;

interface GenerationUsage {
  used: number;
  limit: number;
  canGenerate: boolean;
  isLoading: boolean;
}

export function useGenerationLimit() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<GenerationUsage>({
    used: 0,
    limit: FREE_PLAN_MONTHLY_LIMIT,
    canGenerate: true,
    isLoading: true,
  });
  const [plan, setPlan] = useState<'free' | 'pro' | 'annual'>('free');

  const fetchUsage = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      const userPlan = (profile?.plan || 'free') as 'free' | 'pro' | 'annual';
      setPlan(userPlan);

      // Pro/Annual has unlimited generations
      if (userPlan !== 'free') {
        setUsage({
          used: 0,
          limit: Infinity,
          canGenerate: true,
          isLoading: false,
        });
        return;
      }

      // Count generations this month for free plan
      const now = new Date();
      const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const { count, error } = await supabase
        .from('routine_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth);

      if (error) {
        console.error('Generation count error:', error);
        return;
      }

      const used = count || 0;

      setUsage({
        used,
        limit: FREE_PLAN_MONTHLY_LIMIT,
        canGenerate: used < FREE_PLAN_MONTHLY_LIMIT,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch usage error:', error);
      setUsage(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Check if a specific week can be generated (already generated weeks don't count against limit)
  const canGenerateForWeek = useCallback(async (weekStart: string): Promise<boolean> => {
    if (!user) return false;
    if (plan !== 'free') return true;

    // Check if this week was already generated
    const { data: existingGeneration } = await supabase
      .from('routine_generations')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle();

    // If re-generating same week, allow it
    if (existingGeneration) return true;

    // Otherwise check monthly limit
    return usage.canGenerate;
  }, [user, plan, usage.canGenerate]);

  return {
    ...usage,
    plan,
    refetch: fetchUsage,
    canGenerateForWeek,
    FREE_PLAN_MONTHLY_LIMIT,
  };
}
