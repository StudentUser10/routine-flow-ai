import { Gauge, Infinity, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdjustments } from '@/hooks/useAdjustments';
import { useNavigate } from 'react-router-dom';

interface AdjustmentsRemainingProps {
  className?: string;
  compact?: boolean;
}

export function AdjustmentsRemaining({ className, compact = false }: AdjustmentsRemainingProps) {
  const { status, loading } = useAdjustments();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-xl h-16", className)} />
    );
  }

  const isUnlimited = status?.plan === 'pro' || status?.plan === 'annual';
  const used = status?.adjustmentsUsed || 0;
  const limit = status?.adjustmentsLimit || 3;
  const remaining = status?.remaining || 0;
  const percentage = isUnlimited ? 0 : (used / limit) * 100;

  if (compact) {
    if (isUnlimited) {
      return (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
          <Infinity className="w-4 h-4" />
          <span>Ajustes ilimitados</span>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Gauge className="w-4 h-4 text-muted-foreground" />
        <span className={remaining === 0 ? 'text-destructive font-medium' : ''}>
          {remaining} ajuste(s) restante(s)
        </span>
      </div>
    );
  }

  if (isUnlimited) {
    return (
      <div className={cn("p-4 bg-card border border-border rounded-xl", className)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Infinity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Ajustes Ilimitados</p>
            <p className="text-sm text-muted-foreground">
              Plano {status?.plan === 'annual' ? 'Pro Anual' : 'Pro'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card border border-border rounded-xl space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Ajustes do Mês</span>
        </div>
        <span className={cn(
          "font-bold",
          remaining === 0 && "text-destructive"
        )}>
          {remaining}/{limit}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      {remaining === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            Limite atingido. Faça upgrade para ajustes ilimitados.
          </p>
          <Button 
            className="w-full gap-2" 
            size="sm"
            onClick={() => navigate('/planos')}
          >
            <Crown className="w-4 h-4" />
            Fazer upgrade
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Você pode fazer mais {remaining} ajuste(s) este mês.
        </p>
      )}
    </div>
  );
}
