import { X } from "lucide-react";

const pains = [
  "Começa a semana motivado e abandona no meio",
  "Não sabe por onde começar o dia",
  "Planeja demais e executa pouco",
  "Sente culpa por não manter uma rotina",
  "Já tentou vários apps e nenhum funcionou",
];

export function PainPoints() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-12">
            Se você se identifica com isso...
          </h2>

          <div className="space-y-4">
            {pains.map((pain, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
              >
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-foreground/90 text-base sm:text-lg">
                  {pain}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10 text-lg">
            Você não precisa de mais disciplina.<br />
            <span className="text-foreground font-medium">Precisa do sistema certo.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
