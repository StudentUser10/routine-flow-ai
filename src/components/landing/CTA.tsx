import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Uma semana. 8 perguntas.{" "}
            <br />
            <span className="text-primary">Uma rotina que finalmente funciona.</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-8">
            Você não precisa mudar quem você é. Só precisa de um sistema que funcione do jeito que você já é.{" "}
            <strong className="text-foreground">A IA não te julga — ela te organiza.</strong>
          </p>

          <div className="pt-2">
            <Link to="/cadastro">
              <Button
                size="xl"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-7 text-base sm:text-lg h-auto shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                CRIAR MINHA ROTINA GRATUITA AGORA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/60 mt-6">
            Sem cartão de crédito • Sem compromisso • Sem mais uma semana perdida
          </p>
        </motion.div>
      </div>
    </section>
  );
}
