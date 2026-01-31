import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">RotinAI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/termos" className="hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <a href="mailto:contato@rotinai.com" className="hover:text-foreground transition-colors">
              Contato
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} RotinAI
          </p>
        </div>
      </div>
    </footer>
  );
}
