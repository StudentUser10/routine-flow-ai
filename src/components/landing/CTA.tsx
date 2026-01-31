import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Comece agora.
            <br />
            <span className="text-muted-foreground font-normal text-xl sm:text-2xl">
              Leva menos de 2 minutos.
            </span>
          </h2>

          <div className="pt-8">
            <Link to="/cadastro">
              <Button 
                size="xl" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-7 text-lg h-auto shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                Criar minha rotina gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/60 mt-6">
            Sem cartão • Sem compromisso • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
