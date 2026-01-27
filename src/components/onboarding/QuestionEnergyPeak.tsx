import { Button } from "@/components/ui/button";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  {
    value: "early_morning",
    label: "Bem cedo",
    description: "5h - 8h",
    icon: Sunrise,
  },
  {
    value: "morning",
    label: "Manhã",
    description: "8h - 12h",
    icon: Sun,
  },
  {
    value: "afternoon",
    label: "Tarde",
    description: "12h - 18h",
    icon: Sunset,
  },
  {
    value: "evening",
    label: "Noite",
    description: "18h - 23h",
    icon: Moon,
  },
];

export function QuestionEnergyPeak({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-focus mb-4">
          <Sun className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Quando você tem mais energia?
        </h1>
        <p className="text-muted-foreground">
          Vamos alocar suas tarefas importantes no seu pico de energia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => onChange(option.value)}
              className={`h-auto py-6 flex flex-col items-center gap-2 ${
                isSelected ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
              }`}
            >
              <Icon className={`w-8 h-8 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-center">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
