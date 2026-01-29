import { Gauge, Infinity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';

export function AdjustmentsIndicator() {
  const { plan, adjustmentsUsed, adjustmentsLimit } = useSubscription();

  if (plan !== 'free') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Infinity className="w-4 h-4" />
        <span>Ajustes ilimitados</span>
      </div>
    );
  }

  const remaining = Math.max(0, adjustmentsLimit - adjustmentsUsed);
  const percentage = (adjustmentsUsed / adjustmentsLimit) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Gauge className="w-4 h-4" />
          <span>Ajustes restantes</span>
        </div>
        <span className={remaining === 0 ? 'text-destructive font-medium' : 'text-foreground'}>
          {remaining}/{adjustmentsLimit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {remaining === 0 && (
        <p className="text-xs text-destructive">
          Limite atingido. Faça upgrade para Pro para ajustes ilimitados.
        </p>
      )}
    </div>
  );
}
