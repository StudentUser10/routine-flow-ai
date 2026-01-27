import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Moon } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionSleepTime({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
          <Moon className="w-8 h-8 text-secondary-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          A que horas você costuma dormir?
        </h1>
        <p className="text-muted-foreground">
          Vamos garantir tempo adequado de descanso para você.
        </p>
      </div>

      <div className="max-w-xs mx-auto space-y-2">
        <Label htmlFor="sleep-time">Horário de dormir</Label>
        <Input
          id="sleep-time"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 text-center text-xl"
        />
      </div>
    </div>
  );
}
