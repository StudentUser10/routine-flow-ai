import { X, Brain } from "lucide-react";
import { motion } from "framer-motion";

const pains = [
  "Acorda motivado, trava na hora de decidir por onde começar",
  "Chega ao final do dia exausto — sem ter feito quase nada produtivo",
  "Planeja demais, executa pouco e sente culpa no final da semana",
  "Já tentou Notion, GTD, bloquear celular, acordar cedo... e nada funcionou",
  "Gasta mais energia decidindo O QUE fazer do que FAZENDO",
];

export function PainPoints() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              O Ladrão Silencioso de Energia
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              Se você se identifica com isso,{" "}
              <span className="text-destructive">o problema não é você.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              É o seu cérebro gastando bateria em micro-decisões — antes de você começar a trabalhar de verdade.
            </p>
          </motion.div>

          <div className="space-y-3">
            {pains.map((pain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
              >
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-foreground/90 text-base sm:text-lg">
                  {pain}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 p-6 rounded-2xl bg-card border border-border text-center"
          >
            <p className="text-lg text-muted-foreground">
              Em 1998, o psicólogo <strong className="text-foreground">Roy Baumeister</strong> provou:{" "}
              a força de vontade se esgota como bateria de celular.
            </p>
            <p className="text-foreground font-semibold text-lg mt-3">
              O que drena mais rápido? <span className="text-primary">Decisões.</span> Qualquer decisão.
            </p>
            <p className="text-muted-foreground mt-2">
              "O que faço primeiro?" drena tanto quanto "Devo aceitar esse emprego?"
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
