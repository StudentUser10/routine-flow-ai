import { Shield, CreditCard, Clock, XCircle } from "lucide-react";

const guarantees = [
  {
    icon: CreditCard,
    text: "Sem cartão de crédito",
  },
  {
    icon: Shield,
    text: "Plano gratuito disponível",
  },
  {
    icon: XCircle,
    text: "Cancele quando quiser",
  },
  {
    icon: Clock,
    text: "Sem compromisso",
  },
];

export function LowRisk() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-display font-semibold mb-8 text-muted-foreground">
            Teste sem risco
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {guarantees.map((guarantee, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <guarantee.icon className="w-6 h-6 text-primary/70" />
                <span className="text-sm text-muted-foreground text-center">
                  {guarantee.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
