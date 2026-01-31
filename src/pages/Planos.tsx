import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, STRIPE_PRICES } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CalendarDays, Loader2, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      'Rotina semanal gerada por IA',
      '3 gerações de rotina por mês',
      'Visualização diária e semanal',
      'Checklist com progresso',
    ],
    priceId: null,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Mensal',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Para quem quer mais controle',
    features: [
      'Tudo do plano Free',
      'Gerações ilimitadas',
      'Regeneração a qualquer momento',
      'IA adaptativa contínua',
      'Suporte prioritário',
    ],
    priceId: STRIPE_PRICES.pro_monthly,
    popular: true,
  },
  {
    id: 'annual',
    name: 'Pro Anual',
    price: 'R$ 289,90',
    period: '/ano',
    originalPrice: 'R$ 358,80',
    description: 'Economize 2 meses',
    features: [
      'Tudo do plano Pro',
      'Desconto de 19%',
      'Acesso antecipado a novidades',
      'Análises avançadas',
    ],
    priceId: STRIPE_PRICES.pro_annual,
    popular: false,
  },
];

export default function Planos() {
  const { user, loading: authLoading } = useAuth();
  const { plan: currentPlan, loading: subLoading, openCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Pagamento confirmado com sucesso!');
      checkSubscription();
    } else if (payment === 'cancelled') {
      toast.info('Pagamento cancelado.');
    }
  }, [searchParams, checkSubscription]);

  const handleSelectPlan = async (priceId: string | null) => {
    if (!priceId) {
      toast.info('Você já está no plano Free');
      return;
    }
    await openCheckout(priceId);
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">RotinAI</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial da sua rotina com gerações ilimitadas e IA adaptativa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((planItem) => {
            const isCurrentPlan = currentPlan === planItem.id;
            const isUpgrade = 
              (currentPlan === 'free' && planItem.id !== 'free') ||
              (currentPlan === 'pro' && planItem.id === 'annual');

            return (
              <Card 
                key={planItem.id} 
                className={`relative ${planItem.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {planItem.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-secondary text-secondary-foreground">
                    Seu plano
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2">
                    {planItem.id === 'free' ? (
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Crown className="w-5 h-5 text-primary" />
                    )}
                    <CardTitle>{planItem.name}</CardTitle>
                  </div>
                  <CardDescription>{planItem.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{planItem.price}</span>
                      <span className="text-muted-foreground">{planItem.period}</span>
                    </div>
                    {planItem.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        {planItem.originalPrice}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {planItem.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    currentPlan !== 'free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={openCustomerPortal}
                      >
                        Gerenciar assinatura
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-full" disabled>
                        Plano atual
                      </Button>
                    )
                  ) : isUpgrade ? (
                    <Button 
                      className="w-full"
                      onClick={() => handleSelectPlan(planItem.priceId)}
                    >
                      {planItem.id === 'annual' ? 'Fazer upgrade' : 'Assinar agora'}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSelectPlan(planItem.priceId)}
                    >
                      Selecionar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {currentPlan !== 'free' && (
          <div className="text-center mt-8">
            <Button variant="link" onClick={openCustomerPortal}>
              Gerenciar assinatura no Stripe
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
