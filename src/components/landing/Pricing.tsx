import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a organizar sua rotina",
    features: [
      "1 rotina semanal gerada",
      "3 gerações por mês",
      "Alertas básicos",
      "Visualização semanal",
      "Feedback simples",
    ],
    cta: "Começar grátis",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    description: "Para quem leva produtividade a sério",
    features: [
      "Rotinas ilimitadas",
      "Gerações ilimitadas",
      "IA adaptativa avançada",
      "Detecção de sobrecarga",
      "Modo semana caótica",
      "Relatórios de consistência",
      "Rotinas alternativas",
      "Suporte prioritário",
    ],
    cta: "Assinar plano Pro",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Anual",
    price: "R$ 19",
    period: "/mês",
    originalPrice: "R$ 348",
    finalPrice: "R$ 228/ano",
    description: "Economize 35% no plano anual",
    features: [
      "Tudo do Pro",
      "Desconto automático",
      "Controle de versão da rotina",
      "Duplicação de semanas",
      "Histórico completo",
      "Exportação de dados",
    ],
    cta: "Plano anual com desconto",
    variant: "hero" as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece grátis e evolua conforme precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-large ${
                plan.popular
                  ? "bg-primary text-primary-foreground border-primary shadow-glow scale-105"
                  : "bg-background border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-focus text-white text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Mais popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>
                {plan.finalPrice && (
                  <p className={`text-sm mt-1 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    <span className="line-through">{plan.originalPrice}</span> → {plan.finalPrice}
                  </p>
                )}
                <p className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-rest" : "text-rest"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/cadastro">
                <Button
                  variant={plan.popular ? "secondary" : plan.variant}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
