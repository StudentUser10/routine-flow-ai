import { Button } from "@/components/ui/button";
import { RoutineBlock } from "@/pages/Rotina";
import { ThumbsUp, ThumbsDown, Clock } from "lucide-react";

interface Props {
  blocks: RoutineBlock[];
  selectedDay: number;
  onDayChange: (day: number) => void;
  onFeedback: (blockId: string, worked: boolean) => void;
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SHORT_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const BLOCK_COLORS = {
  focus: "border-l-focus-block bg-focus-block/5",
  rest: "border-l-rest-block bg-rest-block/5",
  personal: "border-l-personal-block bg-personal-block/5",
  fixed: "border-l-fixed-block bg-fixed-block/5",
};

const BLOCK_LABELS = {
  focus: "Foco",
  rest: "Descanso",
  personal: "Pessoal",
  fixed: "Fixo",
};

export function RoutineDayView({ blocks, selectedDay, onDayChange, onFeedback }: Props) {
  const sortedBlocks = [...blocks].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex justify-center gap-1">
        {SHORT_DAYS.map((day, index) => (
          <Button
            key={index}
            variant={selectedDay === index ? "default" : "outline"}
            size="sm"
            onClick={() => onDayChange(index)}
            className="w-10 h-10 rounded-full p-0"
          >
            {day}
          </Button>
        ))}
      </div>

      <h2 className="text-xl font-display font-bold text-center">
        {DAYS[selectedDay]}
      </h2>

      {/* Blocks list */}
      {sortedBlocks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum bloco programado para este dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-4 rounded-lg border-l-4 border border-border ${
                BLOCK_COLORS[block.block_type]
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                      {BLOCK_LABELS[block.block_type]}
                    </span>
                    {block.is_fixed && (
                      <span className="text-xs text-muted-foreground">• Fixo</span>
                    )}
                  </div>
                  <h3 className="font-medium">{block.title}</h3>
                  {block.description && (
                    <p className="text-sm text-muted-foreground">{block.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {block.start_time} - {block.end_time}
                  </div>
                </div>

                {/* Feedback buttons */}
                {!block.is_fixed && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rest-block hover:bg-rest-block/10"
                      onClick={() => onFeedback(block.id, true)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onFeedback(block.id, false)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
