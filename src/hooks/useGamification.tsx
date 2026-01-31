import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export type BlockStatusType = 'pending' | 'completed' | 'skipped';

export interface BlockStatus {
  id: string;
  block_id: string;
  user_id: string;
  date: string;
  status: BlockStatusType;
  completed_at: string | null;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  blocks_total: number;
  blocks_completed: number;
  blocks_skipped: number;
  completion_percentage: number;
  streak_maintained: boolean;
}

export interface UserGamification {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  current_level: string;
  last_active_date: string | null;
  streak_minimum_percentage: number;
}

const POINTS = {
  COMPLETE_BLOCK: 10,
  VALID_DAY: 50,
  STREAK_BONUS: 25,
  FEEDBACK: 5,
  DAILY_LOGIN: 3,
} as const;

interface LevelInfo {
  name: string;
  minPoints: number;
}

const LEVELS: LevelInfo[] = [
  { name: 'Iniciante', minPoints: 0 },
  { name: 'Consistente', minPoints: 500 },
  { name: 'Disciplinado', minPoints: 1500 },
  { name: 'Mestre da Rotina', minPoints: 5000 },
];

export function useGamification() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blockStatuses, setBlockStatuses] = useState<BlockStatus[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [gamification, setGamification] = useState<UserGamification | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchGamificationData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch or create user gamification record
      const { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (gamError && gamError.code !== 'PGRST116') {
        console.error('Gamification fetch error:', gamError);
      }

      if (!gamData) {
        // Create initial gamification record
        const { data: newGam, error: createError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            total_points: 0,
            current_level: 'iniciante',
          })
          .select()
          .single();

        if (createError) {
          console.error('Create gamification error:', createError);
        } else {
          setGamification(newGam);
        }
      } else {
        setGamification(gamData);
      }

      // Fetch today's block statuses
      const { data: statusData, error: statusError } = await supabase
        .from('block_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (statusError) {
        console.error('Block status fetch error:', statusError);
      } else {
        // Cast status field to BlockStatusType
        const typedStatuses: BlockStatus[] = (statusData || []).map(s => ({
          ...s,
          status: s.status as BlockStatusType,
        }));
        setBlockStatuses(typedStatuses);
      }

      // Fetch today's progress
      const { data: progressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Daily progress fetch error:', progressError);
      }
      
      setDailyProgress(progressData);

    } catch (error) {
      console.error('Gamification fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user, fetchGamificationData]);

  const initializeDayChecklist = useCallback(async (blocks: { id: string; day_of_week: number }[]) => {
    if (!user) return;

    const todayDayOfWeek = new Date().getDay();
    const todaysBlocks = blocks.filter(b => b.day_of_week === todayDayOfWeek);

    if (todaysBlocks.length === 0) return;

    // Check which blocks already have status for today
    const existingBlockIds = blockStatuses.map(s => s.block_id);
    const newBlocks = todaysBlocks.filter(b => !existingBlockIds.includes(b.id));

    if (newBlocks.length === 0) return;

    // Create pending statuses for new blocks
    const { error } = await supabase
      .from('block_status')
      .insert(
        newBlocks.map(block => ({
          user_id: user.id,
          block_id: block.id,
          date: today,
          status: 'pending',
        }))
      );

    if (error) {
      console.error('Initialize checklist error:', error);
    } else {
      await fetchGamificationData();
    }
  }, [user, today, blockStatuses, fetchGamificationData]);

  const updateBlockStatus = useCallback(async (blockId: string, status: BlockStatusType) => {
    if (!user) return false;

    try {
      // Check if status exists
      const existing = blockStatuses.find(s => s.block_id === blockId);

      if (existing) {
        const { error } = await supabase
          .from('block_status')
          .update({
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('block_status')
          .insert({
            user_id: user.id,
            block_id: blockId,
            date: today,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      // Update daily progress
      await updateDailyProgress();
      await fetchGamificationData();

      if (status === 'completed') {
        await addPoints(POINTS.COMPLETE_BLOCK);
        toast.success('Bloco concluído! +10 pontos');
      }

      return true;
    } catch (error) {
      console.error('Update block status error:', error);
      toast.error('Erro ao atualizar status');
      return false;
    }
  }, [user, today, blockStatuses, fetchGamificationData]);

  const updateDailyProgress = useCallback(async () => {
    if (!user) return;

    // Get all block statuses for today
    const { data: statuses, error: statusError } = await supabase
      .from('block_status')
      .select('status')
      .eq('user_id', user.id)
      .eq('date', today);

    if (statusError) {
      console.error('Fetch statuses error:', statusError);
      return;
    }

    const total = statuses?.length || 0;
    const completed = statuses?.filter(s => s.status === 'completed').length || 0;
    const skipped = statuses?.filter(s => s.status === 'skipped').length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streakMaintained = percentage >= (gamification?.streak_minimum_percentage || 70);

    // Upsert daily progress
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: user.id,
        date: today,
        blocks_total: total,
        blocks_completed: completed,
        blocks_skipped: skipped,
        completion_percentage: percentage,
        streak_maintained: streakMaintained,
      }, {
        onConflict: 'user_id,date',
      });

    if (error) {
      console.error('Update daily progress error:', error);
    }

    // Update streak if day is valid
    if (streakMaintained && gamification) {
      await updateStreak();
    }
  }, [user, today, gamification]);

  const updateStreak = useCallback(async () => {
    if (!user || !gamification) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    // Check if last active was yesterday or today
    const lastActive = gamification.last_active_date;
    let newStreak = gamification.current_streak;

    if (!lastActive || lastActive < yesterdayStr) {
      // Streak broken - reset to 1
      newStreak = 1;
    } else if (lastActive === yesterdayStr) {
      // Continuing streak
      newStreak = gamification.current_streak + 1;
    }
    // If lastActive is today, don't change streak

    const newLongest = Math.max(newStreak, gamification.longest_streak);

    const { error } = await supabase
      .from('user_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Update streak error:', error);
    }

    // Bonus points for streak
    if (newStreak > gamification.current_streak) {
      await addPoints(POINTS.STREAK_BONUS);
    }
  }, [user, gamification, today]);

  const addPoints = useCallback(async (points: number) => {
    if (!user || !gamification) return;

    const newTotal = gamification.total_points + points;
    
    // Calculate new level
    let newLevel = 'iniciante';
    for (const level of LEVELS) {
      if (newTotal >= level.minPoints) {
        newLevel = level.name.toLowerCase();
      }
    }

    const { error } = await supabase
      .from('user_gamification')
      .update({
        total_points: newTotal,
        current_level: newLevel,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Add points error:', error);
    }
  }, [user, gamification]);

  const getBlockStatus = useCallback((blockId: string): BlockStatusType => {
    const status = blockStatuses.find(s => s.block_id === blockId);
    return status?.status as BlockStatusType || 'pending';
  }, [blockStatuses]);

  const getLevelInfo = useCallback((): { currentLevel: LevelInfo; nextLevel: LevelInfo | null; progressToNext: number } => {
    const points = gamification?.total_points || 0;
    let currentLevel: LevelInfo = LEVELS[0];
    let nextLevel: LevelInfo | null = LEVELS[1] || null;

    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].minPoints) {
        currentLevel = LEVELS[i];
        nextLevel = LEVELS[i + 1] || null;
      }
    }

    const progressToNext = nextLevel 
      ? Math.min(100, Math.round(((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100))
      : 100;

    return { currentLevel, nextLevel, progressToNext };
  }, [gamification]);

  return {
    loading,
    blockStatuses,
    dailyProgress,
    gamification,
    initializeDayChecklist,
    updateBlockStatus,
    getBlockStatus,
    getLevelInfo,
    addPoints,
    refetch: fetchGamificationData,
    POINTS,
  };
}
