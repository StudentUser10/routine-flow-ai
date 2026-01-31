import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">RotinAI</span>
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
