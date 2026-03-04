import { Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LowRisk() {
  return (
    <section className="py-20 sm:py-24 bg-card/50">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-primary/5 text-center mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">
              🛡️ Garantia Tripla RotinAI
            </h2>
            <p className="text-foreground/90 text-base sm:text-lg leading-relaxed mb-4">
              Teste por <strong>7 dias</strong>. Se sua semana não ficar mais leve, mais clara e mais produtiva — 
              cancele com um clique. <strong>Você fica com todos os bônus.</strong>
            </p>
            <p className="text-muted-foreground text-sm">
              Sem perguntas. Sem burocracia. Sem culpa. Ponto final.
            </p>
          </motion.div>

          {/* Scarcity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive text-sm uppercase tracking-wider">
                Escassez Real
              </span>
            </div>
            <p className="text-foreground/90 text-base mb-3">
              O Bônus #3 (Comunidade Privada) tem limite de <strong>200 novas entradas</strong>.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
              <span className="text-destructive font-display font-bold text-xl">47</span>
              <span className="text-destructive/80 text-sm">vagas restantes com bônus completo</span>
            </div>
            <p className="text-muted-foreground text-xs">
              Após o limite, o acesso à comunidade será vendido por R$147/mês — separadamente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
