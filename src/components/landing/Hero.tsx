import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main headline - clear and direct */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.1] tracking-tight">
            Organize sua rotina{" "}
            <span className="text-primary">sem esforço</span>
            <br className="hidden sm:block" />
            — todos os dias.
          </h1>

          {/* Supporting text - one line */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Uma rotina inteligente que se adapta à sua vida, não o contrário.
          </p>

          {/* Single CTA - prominent */}
          <div className="pt-4">
            <Link to="/cadastro">
              <Button 
                size="xl" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg h-auto shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                Criar minha rotina agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Trust indicator - minimal */}
          <p className="text-sm text-muted-foreground/70 pt-2">
            Gratuito • Sem cartão de crédito • 2 minutos para começar
          </p>
        </div>
      </div>
    </section>
  );
}
