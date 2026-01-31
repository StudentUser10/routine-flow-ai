import { MessageCircle, Cpu, Play } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MessageCircle,
    title: "Responda perguntas rápidas",
    description: "Sobre seus horários, energia e objetivos.",
  },
  {
    number: "2",
    icon: Cpu,
    title: "Receba sua rotina personalizada",
    description: "A IA cria uma semana sob medida para você.",
  },
  {
    number: "3",
    icon: Play,
    title: "Apenas siga o que aparece hoje",
    description: "Sem decisões. Só execução.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            3 passos. Menos de 2 minutos.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
              >
                {/* Step number */}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>

                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
