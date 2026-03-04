import { Check } from "lucide-react";
import { motion } from "framer-motion";

const bullets = [
  "Como eliminar a paralisia matinal em menos de 60 segundos",
  "O segredo que pessoas de alta performance usam para manter rotinas em dias de caos",
  "Por que sua lista de tarefas está te sabotando — e o que usar no lugar",
  "Como recuperar uma semana perdida sem começar tudo do zero",
  "A técnica de 'decisão zero' que libera horas de energia mental todo dia",
  "Como a IA identifica seu pico de foco e coloca as tarefas certas nesse momento",
];

export function Bullets() {
  return (
    <section className="py-16 sm:py-20 bg-card/50">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl font-display font-bold text-center mb-10"
          >
            Com o RotinAI, você descobre:
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bullets.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/90 text-sm">{bullet}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
