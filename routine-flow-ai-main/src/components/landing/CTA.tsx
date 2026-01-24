import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-focus/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-personal/20 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Comece agora, é grátis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6">
            Sua rotina ideal está a 8 perguntas de distância
          </h2>

          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Pare de perder tempo organizando. Deixe a IA fazer o trabalho pesado 
            enquanto você foca no que realmente importa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/cadastro">
              <Button 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-large"
              >
                Criar minha rotina automaticamente
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-primary-foreground/60 mt-6">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
