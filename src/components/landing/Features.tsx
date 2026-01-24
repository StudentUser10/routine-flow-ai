import { 
  CalendarDays, 
  Brain, 
  RefreshCw, 
  Bell, 
  BarChart3, 
  Zap,
  Target,
  Coffee
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Questionário Inteligente",
    description: "8 perguntas que capturam sua vida real: horários, energia, compromissos e objetivos.",
    color: "text-personal",
    bg: "bg-personal/10",
  },
  {
    icon: CalendarDays,
    title: "Rotina Semanal Automática",
    description: "IA gera uma semana completa com blocos de foco, descanso e tarefas distribuídas.",
    color: "text-focus",
    bg: "bg-focus/10",
  },
  {
    icon: RefreshCw,
    title: "Ajustes Adaptativos",
    description: "Diga se funcionou ou não. A IA aprende e ajusta automaticamente sua rotina.",
    color: "text-rest",
    bg: "bg-rest/10",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Lembretes no momento certo para você nunca perder um bloco importante.",
    color: "text-fixed",
    bg: "bg-fixed/10",
  },
  {
    icon: Target,
    title: "Blocos de Foco",
    description: "Períodos otimizados para trabalho profundo, respeitando seu pico de energia.",
    color: "text-focus",
    bg: "bg-focus/10",
  },
  {
    icon: Coffee,
    title: "Pausas Automáticas",
    description: "Descansos inseridos estrategicamente para manter sua produtividade sustentável.",
    color: "text-rest",
    bg: "bg-rest/10",
  },
  {
    icon: BarChart3,
    title: "Relatórios de Adesão",
    description: "Acompanhe sua consistência e veja como sua rotina evolui ao longo do tempo.",
    color: "text-personal",
    bg: "bg-personal/10",
  },
  {
    icon: Zap,
    title: "Modo Semana Caótica",
    description: "Para semanas atípicas, a IA cria uma rotina especial que ainda funciona.",
    color: "text-focus",
    bg: "bg-focus/10",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="text-gradient">organizar sua vida</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Funcionalidades pensadas para quem quer produtividade real, 
            sem complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/20 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
