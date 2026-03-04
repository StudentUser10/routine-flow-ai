import { MessageCircle, Cpu, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "1",
    icon: MessageCircle,
    title: "Responda 8 perguntas reais",
    description: "Sobre sua vida real — não uma versão idealizada. Seus horários, energia e objetivos verdadeiros.",
  },
  {
    number: "2",
    icon: Cpu,
    title: "A IA cria sua rotina sob medida",
    description: "Em menos de 2 minutos, uma semana inteira organizada — com as tarefas certas nos momentos certos.",
  },
  {
    number: "3",
    icon: Play,
    title: "Só execute o que aparece na tela",
    description: "Uma coisa de cada vez. Sem lista infinita. Sem angústia. Decisão zero. Só execução.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
            3 passos. <span className="text-primary">Menos de 2 minutos.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Você responde. A IA organiza. Você executa.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mid-page CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/cadastro">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02]"
            >
              Quero minha rotina agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
