import { Slider } from "@/components/ui/slider";
import { Brain } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const MARKS = [
  { value: 25, label: "25min (Pomodoro)" },
  { value: 45, label: "45min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h30 (Deep Work)" },
  { value: 120, label: "2 horas" },
];

export function QuestionFocusDuration({ value, onChange }: Props) {
  const getLabel = () => {
    const mark = MARKS.find((m) => m.value === value);
    if (mark) return mark.label;
    return `${value} minutos`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-personal-block/10 mb-4">
          <Brain className="w-8 h-8 text-personal-block" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Quanto tempo você consegue manter o foco?
        </h1>
        <p className="text-muted-foreground">
          Vamos criar blocos de trabalho que respeitem seu limite.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-4xl font-display font-bold text-primary">{value}</span>
          <span className="text-xl text-muted-foreground ml-2">minutos</span>
        </div>

        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={15}
          max={120}
          step={5}
          className="py-4"
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {MARKS.map((mark) => (
            <button
              key={mark.value}
              onClick={() => onChange(mark.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                value === mark.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {mark.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
