import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const benefits = [
  "Rotina semanal personalizada em minutos",
  "IA que aprende com seu feedback",
  "Ajustes automáticos conforme sua vida muda",
  "Alertas inteligentes para nunca perder um bloco",
];

export default function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement signup
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-6">
            Comece sua jornada para uma rotina perfeita
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rest flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-primary-foreground/90">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl">RotinAI</span>
            </Link>

            <h1 className="text-2xl font-display font-bold mb-2">Crie sua conta</h1>
            <p className="text-muted-foreground">É grátis e leva menos de 1 minuto.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar minha conta grátis"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link to="/termos" className="text-foreground font-medium hover:underline">
              Termos de uso
            </Link>{" "}
            e{" "}
            <Link to="/privacidade" className="text-foreground font-medium hover:underline">
              Política de privacidade
            </Link>
            .
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
