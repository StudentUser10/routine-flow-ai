import { Check } from "lucide-react";

const benefits = [
  "Se você trabalha ou não",
  "Se seus horários mudam toda semana",
  "Se sua energia varia durante o dia",
  "Se você perde um dia, o sistema se adapta",
];

export function Promise() {
  return (
    <section className="py-20 sm:py-24 bg-card/50">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-6">
            Uma rotina que se ajusta{" "}
            <span className="text-primary">automaticamente</span>{" "}
            à sua realidade.
          </h2>

          <p className="text-muted-foreground text-lg mb-10">
            Não é mais um planner genérico. É uma IA que entende sua vida.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground/90 text-sm sm:text-base">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
