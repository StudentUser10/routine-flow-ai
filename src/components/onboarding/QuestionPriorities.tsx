import { Button } from "@/components/ui/button";
import { Scale, Briefcase, Heart, GraduationCap, Users, Dumbbell, Palette, Wallet } from "lucide-react";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const OPTIONS = [
  { value: "career", label: "Carreira", icon: Briefcase },
  { value: "health", label: "Saúde", icon: Heart },
  { value: "learning", label: "Aprendizado", icon: GraduationCap },
  { value: "relationships", label: "Relacionamentos", icon: Users },
  { value: "fitness", label: "Exercícios", icon: Dumbbell },
  { value: "hobbies", label: "Hobbies", icon: Palette },
  { value: "finances", label: "Finanças", icon: Wallet },
];

export function QuestionPriorities({ value, onChange }: Props) {
  const togglePriority = (priority: string) => {
    if (value.includes(priority)) {
      onChange(value.filter((p) => p !== priority));
    } else if (value.length < 3) {
      onChange([...value, priority]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rest-block/10 mb-4">
          <Scale className="w-8 h-8 text-rest-block" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Quais são suas prioridades de vida?
        </h1>
        <p className="text-muted-foreground">
          Escolha até 3 áreas que mais importam para você agora.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isSelected = value.includes(option.value);
          const order = value.indexOf(option.value);

          return (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => togglePriority(option.value)}
              disabled={value.length >= 3 && !isSelected}
              className={`h-auto py-4 flex flex-col items-center gap-2 relative ${
                isSelected ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {order + 1}
                </span>
              )}
              <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">{option.label}</span>
            </Button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {value.length}/3 prioridades selecionadas
        {value.length > 0 && " (em ordem de importância)"}
      </p>
    </div>
  );
}
