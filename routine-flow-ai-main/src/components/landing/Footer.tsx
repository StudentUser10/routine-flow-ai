import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">RotinAI</span>
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              Sua rotina ideal, gerada automaticamente. Deixe a IA organizar sua semana 
              enquanto você foca no que realmente importa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <a href="#features" className="hover:text-primary-foreground transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary-foreground transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <Link to="/suporte" className="hover:text-primary-foreground transition-colors">
                  Central de ajuda
                </Link>
              </li>
              <li>
                <a href="mailto:contato@rotinai.com" className="hover:text-primary-foreground transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <Link to="/termos" className="hover:text-primary-foreground transition-colors">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-primary-foreground transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          <p>© {new Date().getFullYear()} RotinAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
