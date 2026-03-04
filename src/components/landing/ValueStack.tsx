import { Gift, Zap, BarChart3, Users, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const bonuses = [
  {
    icon: Zap,
    label: "BÔNUS #1",
    title: "Protocolo de Retomada Rápida",
    value: "R$97",
    description:
      "O 'Modo Emergência IA': quando tudo sai do controle, você responde 3 perguntas e a IA reconstrói seu dia em 60 segundos. Sem culpa. Sem drama. Só execução.",
  },
  {
    icon: BarChart3,
    label: "BÔNUS #2",
    title: "Mapa de Energia Pessoal",
    value: "R$67",
    description:
      "Um diagnóstico que mapeia seus picos e vales de energia. A IA coloca trabalho profundo quando você está no pico, e tarefas leves quando está no vale.",
  },
  {
    icon: Users,
    label: "BÔNUS #3",
    title: 'Comunidade Privada "Rotina que Funciona"',
    value: "R$147",
    description:
      "Acesso ao grupo fechado com +4.200 membros ativos. Toda segunda-feira, alguém compartilha como transformou uma semana caótica em uma semana de resultados.",
  },
];

export function ValueStack() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Oferta por tempo limitado
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              Tudo que você recebe ao ativar{" "}
              <span className="text-primary">sua rotina HOJE</span>
            </h2>
          </motion.div>

          {/* Main product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Sua Rotina Semanal Personalizada com IA
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Gerada em 2 minutos. Adaptada ao seu ritmo, energia e objetivos reais. 
                  Se você perder um dia, o sistema recalibra automaticamente.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bonuses */}
          <div className="space-y-3 mb-8">
            {bonuses.map((bonus, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl bg-card border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <bonus.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {bonus.label}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        Valor: {bonus.value}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground">{bonus.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{bonus.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-card border-2 border-primary/30 text-center"
          >
            <p className="text-muted-foreground text-sm mb-1">Valor total do pacote:</p>
            <p className="text-2xl font-display font-bold text-muted-foreground line-through mb-1">
              R$311
            </p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-primary">
              GRATUITO
            </p>
            <p className="text-sm text-muted-foreground mt-1">no plano de entrada</p>

            <div className="mt-6">
              <Link to="/cadastro">
                <Button
                  size="xl"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base sm:text-lg h-auto shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] w-full sm:w-auto"
                >
                  Ativar minha rotina com bônus
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
