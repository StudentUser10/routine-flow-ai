import { Star, Award, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGamification } from '@/hooks/useGamification';

interface PointsLevelProps {
  className?: string;
  compact?: boolean;
}

const LEVEL_ICONS: Record<string, typeof Star> = {
  'iniciante': Star,
  'consistente': Zap,
  'disciplinado': Award,
  'mestre da rotina': Award,
};

const LEVEL_COLORS: Record<string, string> = {
  'iniciante': 'text-muted-foreground',
  'consistente': 'text-blue-500',
  'disciplinado': 'text-purple-500',
  'mestre da rotina': 'text-primary',
};

export function PointsLevel({ className, compact = false }: PointsLevelProps) {
  const { gamification, getLevelInfo, loading } = useGamification();

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-xl h-20", className)} />
    );
  }

  const points = gamification?.total_points || 0;
  const level = gamification?.current_level || 'iniciante';
  const { currentLevel, nextLevel, progressToNext } = getLevelInfo();

  const LevelIcon = LEVEL_ICONS[level] || Star;
  const levelColor = LEVEL_COLORS[level] || 'text-muted-foreground';

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <LevelIcon className={cn("w-5 h-5", levelColor)} />
          <span className="font-medium capitalize">{level}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{points} pts</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card border border-border rounded-xl space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">Nível & Pontos</h3>
        <span className="text-lg font-bold">{points} pts</span>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("p-3 rounded-full bg-muted", levelColor)}>
          <LevelIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-medium capitalize">{level}</p>
          {nextLevel && (
            <p className="text-xs text-muted-foreground">
              {nextLevel.minPoints - points} pts para {nextLevel.name}
            </p>
          )}
        </div>
      </div>

      {nextLevel && (
        <div className="space-y-1">
          <Progress value={progressToNext} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentLevel.name}</span>
            <span>{nextLevel.name}</span>
          </div>
        </div>
      )}

      {!nextLevel && (
        <p className="text-sm text-primary text-center font-medium">
          🏆 Você alcançou o nível máximo!
        </p>
      )}
    </div>
  );
}
