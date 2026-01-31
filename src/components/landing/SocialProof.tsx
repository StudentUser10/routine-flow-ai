import { Users, Clock, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "8",
    label: "perguntas rápidas",
  },
  {
    icon: Clock,
    value: "2 min",
    label: "para sua rotina",
  },
  {
    icon: Zap,
    value: "7 dias",
    label: "planejados por IA",
  },
];

export function SocialProof() {
  return (
    <section className="py-16 sm:py-20 bg-card/50">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Value proposition */}
          <div className="text-center p-6 sm:p-8 rounded-2xl bg-card border border-border">
            <p className="text-lg sm:text-xl text-foreground/90 mb-4">
              Você responde perguntas simples sobre seu dia.
              <br />
              <span className="text-primary font-semibold">A IA organiza toda a sua semana.</span>
            </p>
            <p className="text-muted-foreground text-sm">
              Sem planilhas. Sem decisões. Só execução.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
