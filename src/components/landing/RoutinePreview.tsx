import { Coffee, Target, Brain, Moon, Briefcase, Dumbbell } from "lucide-react";

const blocks = [
  { time: "06:00", duration: "1h", title: "Rotina matinal", icon: Coffee, type: "personal" as const },
  { time: "07:00", duration: "3h", title: "Foco profundo", icon: Target, type: "focus" as const },
  { time: "10:00", duration: "30min", title: "Pausa ativa", icon: Coffee, type: "rest" as const },
  { time: "10:30", duration: "2h", title: "Reuniões", icon: Briefcase, type: "fixed" as const },
  { time: "12:30", duration: "1h", title: "Almoço", icon: Coffee, type: "rest" as const },
  { time: "13:30", duration: "2h", title: "Foco criativo", icon: Brain, type: "focus" as const },
  { time: "15:30", duration: "30min", title: "Pausa", icon: Coffee, type: "rest" as const },
  { time: "16:00", duration: "2h", title: "Tarefas leves", icon: Target, type: "focus" as const },
  { time: "18:00", duration: "1h", title: "Exercício", icon: Dumbbell, type: "personal" as const },
  { time: "19:00", duration: "3h", title: "Tempo pessoal", icon: Moon, type: "personal" as const },
];

const typeStyles = {
  focus: "bg-focus/10 border-focus/30 text-focus",
  rest: "bg-rest/10 border-rest/30 text-rest",
  personal: "bg-personal/10 border-personal/30 text-personal",
  fixed: "bg-fixed/10 border-fixed/30 text-fixed",
};

const typeBg = {
  focus: "bg-focus",
  rest: "bg-rest",
  personal: "bg-personal",
  fixed: "bg-fixed",
};

export function RoutinePreview() {
  return (
    <section className="py-24 bg-card overflow-hidden">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Visualize sua semana perfeita
          </h2>
          <p className="text-muted-foreground text-lg">
            Blocos organizados automaticamente para maximizar seu foco e bem-estar.
          </p>
        </div>

        {/* Routine preview card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-2xl border border-border shadow-large p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-lg">Segunda-feira</h3>
                <p className="text-sm text-muted-foreground">Exemplo de rotina gerada</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-focus" />
                  <span className="text-muted-foreground">Foco</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rest" />
                  <span className="text-muted-foreground">Descanso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-personal" />
                  <span className="text-muted-foreground">Pessoal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-fixed" />
                  <span className="text-muted-foreground">Fixo</span>
                </div>
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${typeStyles[block.type]} transition-all duration-300 hover:scale-[1.01] hover:shadow-soft`}
                >
                  <div className={`w-10 h-10 rounded-lg ${typeBg[block.type]} flex items-center justify-center`}>
                    <block.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{block.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {block.time} • {block.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
