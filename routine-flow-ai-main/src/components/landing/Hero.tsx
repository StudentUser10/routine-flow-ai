import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-focus/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rest/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-secondary-foreground/10 text-secondary-foreground text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Rotina personalizada com IA em minutos</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-slide-up">
            Sua rotina ideal,{" "}
            <span className="text-gradient">gerada automaticamente</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up delay-100">
            Responda 8 perguntas simples e deixe nossa IA criar uma semana 
            perfeita para você. Ajustes automáticos conforme sua vida muda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up delay-200">
            <Link to="/cadastro">
              <Button variant="hero" size="xl">
                Criar minha rotina automaticamente
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero-outline" size="xl">
                Já tenho uma conta
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-muted-foreground animate-fade-in delay-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-focus" />
              <span className="text-sm">Menos de 3 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-personal" />
              <span className="text-sm">IA adaptativa</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rest" />
              <span className="text-sm">100% personalizado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
