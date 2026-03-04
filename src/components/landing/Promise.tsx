import { X, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const falseSolutions = [
  { name: "Notion", result: "Ficou bonito por uns 3 dias." },
  { name: "Método GTD", result: "Na segunda, o sistema já estava defasado." },
  { name: "Bloquear celular", result: "Voltou em duas horas." },
  { name: "Acordar mais cedo", result: "Durou uma semana." },
  { name: "Coaches de produtividade", result: "Venderam uma versão de você que não existe." },
];

const differences = [
  "Se adapta à SUA vida — não te força a se adaptar a ele",
  "Se você perder um dia, o sistema recalibra automaticamente",
  "Se seus horários mudarem, a IA ajusta sem drama",
  "Te mostra apenas O QUE fazer agora — sem a angústia de ver tudo",
];

export function Promise() {
  return (
    <section className="py-20 sm:py-24 bg-card/50">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              Por que tudo que você tentou antes{" "}
              <span className="text-destructive">não funcionou</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Todos esses sistemas foram feitos para uma versão idealizada de ser humano — 
              consistente, previsível, imune ao caos da vida real.
            </p>
          </motion.div>

          {/* False solutions */}
          <div className="space-y-3 mb-12">
            {falseSolutions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <X className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-foreground font-medium">{item.name}:</span>
                <span className="text-muted-foreground text-sm">{item.result}</span>
              </motion.div>
            ))}
          </div>

          {/* The difference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/15"
          >
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-xl text-foreground">
                O RotinAI é diferente porque:
              </h3>
            </div>
            <div className="space-y-3">
              {differences.map((diff, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/90">{diff}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-4 italic">
              Você não precisa de mais disciplina para seguir uma lista de um item.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
