import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Briefcase } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionWorkHours({ value, onChange }: Props) {
  const [start, end] = value.split("-");

  const handleChange = (type: "start" | "end", newValue: string) => {
    if (type === "start") {
      onChange(`${newValue}-${end || "18:00"}`);
    } else {
      onChange(`${start || "09:00"}-${newValue}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Qual seu horário de trabalho?
        </h1>
        <p className="text-muted-foreground">
          Esses horários serão bloqueados automaticamente na sua rotina.
        </p>
      </div>

      <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="work-start">Início</Label>
          <Input
            id="work-start"
            type="time"
            value={start || "09:00"}
            onChange={(e) => handleChange("start", e.target.value)}
            className="h-14 text-center text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-end">Término</Label>
          <Input
            id="work-end"
            type="time"
            value={end || "18:00"}
            onChange={(e) => handleChange("end", e.target.value)}
            className="h-14 text-center text-lg"
          />
        </div>
      </div>
    </div>
  );
}
