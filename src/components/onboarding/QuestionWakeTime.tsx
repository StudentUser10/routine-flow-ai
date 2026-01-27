import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sun } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionWakeTime({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
          <Sun className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          A que horas você costuma acordar?
        </h1>
        <p className="text-muted-foreground">
          Esse horário vai definir o início do seu dia produtivo.
        </p>
      </div>

      <div className="max-w-xs mx-auto space-y-2">
        <Label htmlFor="wake-time">Horário de acordar</Label>
        <Input
          id="wake-time"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 text-center text-xl"
        />
      </div>
    </div>
  );
}
