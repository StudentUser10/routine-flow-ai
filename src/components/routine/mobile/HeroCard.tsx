import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface HeroCardProps {
  blocks: Block[];
  selectedDay: number;
  onCompleteBlock: (blockId: string) => void;
  getBlockStatus: (blockId: string) => string;
}

const BLOCK_GRADIENTS = {
  focus: "from-focus-block to-orange-400",
  rest: "from-rest-block to-emerald-400",
  personal: "from-personal-block to-violet-400",
  fixed: "from-fixed-block to-slate-400",
};

const BLOCK_LABELS = {
  focus: "Foco",
  rest: "Descanso",
  personal: "Pessoal",
  fixed: "Fixo",
};

export function HeroCard({ blocks, selectedDay, onCompleteBlock, getBlockStatus }: HeroCardProps) {
  const now = new Date();
  const currentTime = format(now, "HH:mm");
  const isToday = selectedDay === now.getDay();

  // Find current or next block
  const heroBlock = useMemo(() => {
    const sortedBlocks = [...blocks].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );

    if (isToday) {
      // Find block in progress
      const currentBlock = sortedBlocks.find(
        b => b.start_time <= currentTime && b.end_time > currentTime
      );
      if (currentBlock) return { block: currentBlock, status: "now" as const };

      // Find next block
      const nextBlock = sortedBlocks.find(b => b.start_time > currentTime);
      if (nextBlock) return { block: nextBlock, status: "next" as const };

      // All blocks finished
      const lastBlock = sortedBlocks[sortedBlocks.length - 1];
      if (lastBlock) return { block: lastBlock, status: "finished" as const };
    }

    // For other days, show first block
    const firstBlock = sortedBlocks[0];
    if (firstBlock) return { block: firstBlock, status: "scheduled" as const };

    return null;
  }, [blocks, currentTime, isToday]);

  const dayLabel = useMemo(() => {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const today = new Date();
    const targetDate = new Date(today);
    const diff = selectedDay - today.getDay();
    targetDate.setDate(today.getDate() + diff);
    
    return {
      dayName: days[selectedDay],
      date: format(targetDate, "d 'de' MMMM", { locale: ptBR })
    };
  }, [selectedDay]);

  if (!heroBlock) {
    return (
      <div className="p-6 bg-card border border-border rounded-2xl text-center">
        <p className="text-muted-foreground">Nenhum bloco programado para este dia.</p>
      </div>
    );
  }

  const { block, status } = heroBlock;
  const isCompleted = getBlockStatus(block.id) === "completed";

  const statusConfig = {
    now: { label: "Agora", color: "text-focus-block", pulse: true },
    next: { label: "Próximo", color: "text-muted-foreground", pulse: false },
    finished: { label: "Encerrado", color: "text-muted-foreground", pulse: false },
    scheduled: { label: "Programado", color: "text-muted-foreground", pulse: false },
  };

  const { label: statusLabel, color: statusColor, pulse } = statusConfig[status];

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        status === "now" && "shadow-lg shadow-focus-block/20",
        isCompleted && "opacity-70"
      )}
    >
      {/* Background gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          BLOCK_GRADIENTS[block.block_type]
        )} 
      />
      
      {/* Glow effect for current block */}
      {status === "now" && !isCompleted && (
        <div className="absolute inset-0 bg-white/10 animate-pulse-soft" />
      )}

      {/* Content */}
      <div className="relative z-10 text-white">
        {/* Header with day and status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium opacity-90">{dayLabel.dayName}</p>
            <p className="text-xs opacity-75">{dayLabel.date}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm",
            pulse && "animate-pulse-soft"
          )}>
            {status === "now" && <Zap className="w-3.5 h-3.5" />}
            <span className="text-xs font-semibold">{statusLabel}</span>
          </div>
        </div>

        {/* Block type badge */}
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 mb-3">
          {BLOCK_LABELS[block.block_type]}
        </span>

        {/* Title - Full, never truncated */}
        <h2 className="text-xl font-display font-bold mb-2 leading-tight">
          {block.title}
        </h2>

        {/* Description if exists */}
        {block.description && (
          <p className="text-sm opacity-90 mb-3 leading-relaxed">
            {block.description}
          </p>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-sm opacity-90 mb-5">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{block.start_time} - {block.end_time}</span>
        </div>

        {/* CTA Button */}
        {!block.is_fixed && status !== "finished" && (
          <Button
            onClick={() => onCompleteBlock(block.id)}
            disabled={isCompleted}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all",
              isCompleted 
                ? "bg-white/30 text-white/80 cursor-not-allowed"
                : "bg-white text-foreground hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Concluído
              </>
            ) : (
              "Concluir bloco"
            )}
          </Button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 mt-2 text-white/80">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Bloco concluído! 🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}
