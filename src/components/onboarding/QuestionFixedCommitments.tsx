import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, X } from "lucide-react";

interface Commitment {
  day: number;
  start: string;
  end: string;
  title: string;
}

interface Props {
  value: Commitment[];
  onChange: (value: Commitment[]) => void;
}

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export function QuestionFixedCommitments({ value, onChange }: Props) {
  const [newCommitment, setNewCommitment] = useState<Commitment>({
    day: 1,
    start: "19:00",
    end: "20:00",
    title: "",
  });

  const addCommitment = () => {
    if (!newCommitment.title.trim()) return;
    onChange([...value, { ...newCommitment }]);
    setNewCommitment({ day: 1, start: "19:00", end: "20:00", title: "" });
  };

  const removeCommitment = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-fixed-block/10 mb-4">
          <Calendar className="w-8 h-8 text-fixed-block" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Você tem compromissos fixos?
        </h1>
        <p className="text-muted-foreground">
          Adicione atividades que não podem ser alteradas (aulas, terapia, academia).
        </p>
      </div>

      {/* Existing commitments */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((c, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-muted-foreground">
                  {DAYS.find((d) => d.value === c.day)?.label} • {c.start} - {c.end}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCommitment(index)}
                className="text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new commitment */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-4">
        <div className="space-y-2">
          <Label>Nome do compromisso</Label>
          <Input
            value={newCommitment.title}
            onChange={(e) => setNewCommitment((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Aula de inglês"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label>Dia</Label>
            <Select
              value={String(newCommitment.day)}
              onValueChange={(v) => setNewCommitment((prev) => ({ ...prev, day: parseInt(v) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={String(day.value)}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Início</Label>
            <Input
              type="time"
              value={newCommitment.start}
              onChange={(e) => setNewCommitment((prev) => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Fim</Label>
            <Input
              type="time"
              value={newCommitment.end}
              onChange={(e) => setNewCommitment((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <Button onClick={addCommitment} disabled={!newCommitment.title.trim()} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar compromisso
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Não tem nenhum? Sem problema, você pode pular essa etapa.
        </p>
      )}
    </div>
  );
}
