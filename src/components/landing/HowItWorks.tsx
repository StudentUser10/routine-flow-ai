import { MessageSquare, Cpu, Calendar, ThumbsUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Responda 8 perguntas",
    description: "Conte sobre seus horários, energia, compromissos e o que você quer alcançar.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "IA processa suas respostas",
    description: "Nossa inteligência artificial analisa sua vida real e cria uma rotina sob medida.",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Receba sua rotina",
    description: "Uma semana completa com blocos de foco, descanso e tarefas bem distribuídas.",
  },
  {
    number: "04",
    icon: ThumbsUp,
    title: "Dê feedback simples",
    description: "Diga se funcionou ou não. A IA ajusta automaticamente para a próxima semana.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            De zero a uma rotina perfeita em menos de 3 minutos.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-focus via-personal to-rest" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {/* Step circle */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero text-primary-foreground mb-6 shadow-large">
                  <step.icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-focus text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
