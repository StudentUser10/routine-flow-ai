import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[150px] opacity-40" />

      <div className="container relative z-10 px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Urgency badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Restam apenas <strong>47 vagas</strong> com bônus completo</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight"
          >
            Você não é preguiçoso.{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">Seu cérebro está sendo roubado</span>{" "}
            todas as manhãs.
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Cada vez que você pensa{" "}
            <em>"o que eu faço agora?"</em>, seu cérebro gasta a mesma energia que usaria para resolver um problema complexo.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-foreground font-medium"
          >
            O RotinAI elimina esse custo. Responda 8 perguntas. A IA organiza sua semana inteira.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4"
          >
            <Link to="/cadastro">
              <Button
                size="xl"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base sm:text-lg h-auto shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                Criar minha rotina gratuita agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-muted-foreground/70 pt-2"
          >
            Sem cartão de crédito • Leva 2 minutos • +4.200 pessoas já usam
          </motion.p>
        </div>
      </div>
    </section>
  );
}
