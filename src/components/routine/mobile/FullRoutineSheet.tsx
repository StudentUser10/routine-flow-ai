import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Block {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  block_type: "focus" | "rest" | "personal" | "fixed";
  day_of_week: number;
  is_fixed: boolean;
}

interface FullRoutineSheetProps {
  blocks: Block[];
  selectedDay: number;
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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

export function FullRoutineSheet({ blocks, selectedDay }: FullRoutineSheetProps) {
  const sortedBlocks = [...blocks].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-12 gap-2 text-base font-medium border-dashed"
        >
          <Calendar className="w-5 h-5" />
          Ver rotina completa
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-center font-display">
            {DAYS[selectedDay]} - Rotina Completa
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full py-4 space-y-3">
          {sortedBlocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum bloco programado para este dia.</p>
            </div>
          ) : (
            sortedBlocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "p-4 rounded-lg border-l-4 border border-border",
                  BLOCK_COLORS[block.block_type]
                )}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                      {BLOCK_LABELS[block.block_type]}
                    </span>
                    {block.is_fixed && (
                      <span className="text-xs text-muted-foreground">• Fixo</span>
                    )}
                  </div>

                  {/* Title - Full text, never truncated */}
                  <h3 className="font-medium text-base leading-snug">
                    {block.title}
                  </h3>

                  {/* Description */}
                  {block.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {block.description}
                    </p>
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{block.start_time} - {block.end_time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
