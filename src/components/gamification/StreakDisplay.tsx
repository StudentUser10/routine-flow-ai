import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/hooks/useGamification';

interface StreakDisplayProps {
  className?: string;
  compact?: boolean;
}

export function StreakDisplay({ className, compact = false }: StreakDisplayProps) {
  const { gamification, loading } = useGamification();

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-xl h-20", className)} />
    );
  }

  const currentStreak = gamification?.current_streak || 0;
  const longestStreak = gamification?.longest_streak || 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <span className="font-bold text-lg">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">dias</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">Recorde: {longestStreak}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card border border-border rounded-xl space-y-4", className)}>
      <h3 className="font-display font-semibold">Sequência</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <Flame className="w-8 h-8 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">dias seguidos</p>
        </div>

        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">maior sequência</p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="flex items-center gap-2 text-sm text-rest-block">
          <TrendingUp className="w-4 h-4" />
          <span>Você está indo muito bem! Continue assim!</span>
        </div>
      )}

      {currentStreak === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Complete 70% dos blocos de hoje para iniciar uma sequência!
        </p>
      )}
    </div>
  );
}
