import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Coffee } from "lucide-react";

interface WorkDay {
  day: number;
  start: string;
  end: string;
}

interface Props {
  hasFixedWork: boolean;
  workHours: string;
  workDays: WorkDay[];
  onHasFixedWorkChange: (value: boolean) => void;
  onWorkHoursChange: (value: string) => void;
  onWorkDaysChange: (value: WorkDay[]) => void;
}

const DAYS = [
  { value: 1, label: "Segunda", short: "S" },
  { value: 2, label: "Terça", short: "T" },
  { value: 3, label: "Quarta", short: "Q" },
  { value: 4, label: "Quinta", short: "Q" },
  { value: 5, label: "Sexta", short: "S" },
  { value: 6, label: "Sábado", short: "S" },
  { value: 0, label: "Domingo", short: "D" },
];

export function QuestionHasFixedWork({
  hasFixedWork,
  workHours,
  workDays,
  onHasFixedWorkChange,
  onWorkHoursChange,
  onWorkDaysChange,
}: Props) {
  const [startTime, endTime] = workHours.split("-");

  const selectedDays = workDays.map((wd) => wd.day);

  const handleDayToggle = (dayValue: number, checked: boolean) => {
    if (checked) {
      // Add day with current work hours
      onWorkDaysChange([
        ...workDays,
        { day: dayValue, start: startTime || "09:00", end: endTime || "18:00" },
      ]);
    } else {
      // Remove day
      onWorkDaysChange(workDays.filter((wd) => wd.day !== dayValue));
    }
  };

  const handleTimeChange = (type: "start" | "end", newValue: string) => {
    const newStart = type === "start" ? newValue : startTime || "09:00";
    const newEnd = type === "end" ? newValue : endTime || "18:00";
    onWorkHoursChange(`${newStart}-${newEnd}`);

    // Update all work days with new times
    if (workDays.length > 0) {
      onWorkDaysChange(
        workDays.map((wd) => ({
          ...wd,
          start: newStart,
          end: newEnd,
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Você possui um trabalho com horário fixo?
        </h1>
        <p className="text-muted-foreground">
          Isso nos ajuda a criar uma rotina que respeite seus compromissos profissionais.
        </p>
      </div>

      {/* Option buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        <Button
          variant={hasFixedWork ? "default" : "outline"}
          className={`h-24 flex flex-col gap-2 ${
            hasFixedWork ? "ring-2 ring-primary ring-offset-2" : ""
          }`}
          onClick={() => {
            onHasFixedWorkChange(true);
            // Set default work days (Mon-Fri) if empty
            if (workDays.length === 0) {
              onWorkDaysChange([
                { day: 1, start: startTime || "09:00", end: endTime || "18:00" },
                { day: 2, start: startTime || "09:00", end: endTime || "18:00" },
                { day: 3, start: startTime || "09:00", end: endTime || "18:00" },
                { day: 4, start: startTime || "09:00", end: endTime || "18:00" },
                { day: 5, start: startTime || "09:00", end: endTime || "18:00" },
              ]);
            }
          }}
        >
          <Briefcase className="w-6 h-6" />
          <span className="font-medium">Sim, tenho trabalho fixo</span>
        </Button>

        <Button
          variant={!hasFixedWork ? "default" : "outline"}
          className={`h-24 flex flex-col gap-2 ${
            !hasFixedWork ? "ring-2 ring-primary ring-offset-2" : ""
          }`}
          onClick={() => {
            onHasFixedWorkChange(false);
            onWorkDaysChange([]);
          }}
        >
          <Coffee className="w-6 h-6" />
          <span className="font-medium">Não tenho horário fixo</span>
        </Button>
      </div>

      {/* Show work details only if has fixed work */}
      {hasFixedWork && (
        <div className="space-y-6 p-6 bg-card border border-border rounded-xl max-w-lg mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-300">
          {/* Days selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dias de trabalho</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={(checked) =>
                      handleDayToggle(day.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Work hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-start">Início</Label>
              <Input
                id="work-start"
                type="time"
                value={startTime || "09:00"}
                onChange={(e) => handleTimeChange("start", e.target.value)}
                className="h-12 text-center text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-end">Término</Label>
              <Input
                id="work-end"
                type="time"
                value={endTime || "18:00"}
                onChange={(e) => handleTimeChange("end", e.target.value)}
                className="h-12 text-center text-lg"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Esses horários serão bloqueados automaticamente na sua rotina.
          </p>
        </div>
      )}

      {/* Message for no fixed work */}
      {!hasFixedWork && (
        <div className="p-4 bg-secondary/50 border border-border rounded-xl max-w-lg mx-auto text-center animate-in fade-in-0 slide-in-from-top-4 duration-300">
          <p className="text-sm text-muted-foreground">
            Sem problema! Vamos criar uma rotina flexível baseada nos seus objetivos e energia.
          </p>
        </div>
      )}
    </div>
  );
}
