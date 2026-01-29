import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  annual: 'Pro Anual',
};

const planColors: Record<SubscriptionPlan, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-primary text-primary-foreground',
  annual: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
};

export function PlanBadge() {
  const { plan } = useSubscription();

  return (
    <Badge className={`${planColors[plan]} gap-1`}>
      {plan === 'free' ? (
        <Sparkles className="w-3 h-3" />
      ) : (
        <Crown className="w-3 h-3" />
      )}
      {planLabels[plan]}
    </Badge>
  );
}
