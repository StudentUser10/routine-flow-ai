import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, Plus, X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const SUGGESTIONS = [
  "Aprender um novo idioma",
  "Fazer exercícios regularmente",
  "Ler mais livros",
  "Desenvolver um projeto pessoal",
  "Estudar para concurso/prova",
  "Melhorar qualidade do sono",
  "Passar mais tempo com família",
  "Aprender programação",
];

export function QuestionGoals({ value, onChange }: Props) {
  const [customGoal, setCustomGoal] = useState("");

  const toggleGoal = (goal: string) => {
    if (value.includes(goal)) {
      onChange(value.filter((g) => g !== goal));
    } else {
      onChange([...value, goal]);
    }
  };

  const addCustomGoal = () => {
    if (!customGoal.trim() || value.includes(customGoal.trim())) return;
    onChange([...value, customGoal.trim()]);
    setCustomGoal("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-focus-block/10 mb-4">
          <Target className="w-8 h-8 text-focus-block" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Quais são suas principais metas?
        </h1>
        <p className="text-muted-foreground">
          Selecione até 5 metas que você quer alcançar.
        </p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((goal) => (
          <Button
            key={goal}
            variant={value.includes(goal) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleGoal(goal)}
            disabled={value.length >= 5 && !value.includes(goal)}
          >
            {goal}
          </Button>
        ))}
      </div>

      {/* Custom goals */}
      {value.filter((g) => !SUGGESTIONS.includes(g)).length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {value
            .filter((g) => !SUGGESTIONS.includes(g))
            .map((goal) => (
              <div
                key={goal}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm"
              >
                {goal}
                <button onClick={() => toggleGoal(goal)} className="ml-1 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Add custom goal */}
      <div className="flex gap-2 max-w-md mx-auto">
        <Input
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          placeholder="Adicionar meta personalizada"
          onKeyDown={(e) => e.key === "Enter" && addCustomGoal()}
        />
        <Button onClick={addCustomGoal} disabled={!customGoal.trim() || value.length >= 5}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {value.length}/5 metas selecionadas
      </p>
    </div>
  );
}
