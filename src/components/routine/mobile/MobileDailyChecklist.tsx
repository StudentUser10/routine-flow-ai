import { CheckCircle2, Circle, XCircle, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Block {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  block_type: string;
  day_of_week: number;
}

type BlockStatusType = "pending" | "completed" | "skipped";

interface MobileDailyChecklistProps {
  blocks: Block[];
  streak: number;
  progress: number;
  completed: number;
  total: number;
  getBlockStatus: (blockId: string) => BlockStatusType;
  onStatusChange: (blockId: string, status: BlockStatusType) => void;
  className?: string;
}

export function MobileDailyChecklist({
  blocks,
  streak,
  progress,
  completed,
  total,
  getBlockStatus,
  onStatusChange,
  className
}: MobileDailyChecklistProps) {
  const handleClick = (blockId: string) => {
    const currentStatus = getBlockStatus(blockId);
    let newStatus: BlockStatusType;
    switch (currentStatus) {
      case "pending":
        newStatus = "completed";
        break;
      case "completed":
        newStatus = "skipped";
        break;
      case "skipped":
        newStatus = "pending";
        break;
      default:
        newStatus = "completed";
    }
    onStatusChange(blockId, newStatus);
  };

  const getStatusIcon = (status: BlockStatusType) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-rest-block flex-shrink-0" />;
      case "skipped":
        return <XCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground/50 flex-shrink-0" />;
    }
  };

  if (blocks.length === 0) {
    return (
      <div className={cn("p-4 bg-card border border-border rounded-xl", className)}>
        <h3 className="font-display font-semibold mb-2">Checklist do Dia</h3>
        <p className="text-sm text-muted-foreground">Nenhum bloco para hoje.</p>
      </div>
    );
  }

  const isDayValid = progress >= 70;

  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {/* Header with streak */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-base">Checklist do Dia</h3>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-focus-block/10">
                <Flame className="w-4 h-4 text-focus-block" />
                <span className="text-xs font-bold text-focus-block">
                  {streak} dias
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground">
              {completed}/{total}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress 
            value={progress} 
            className={cn(
              "h-2.5 transition-all",
              isDayValid && "shadow-sm shadow-rest-block/30"
            )} 
          />
          {isDayValid && (
            <p className="text-xs text-rest-block font-medium animate-fade-in">
              Sequência mantida 🔥
            </p>
          )}
        </div>
      </div>

      {/* Block list */}
      <div className="divide-y divide-border">
        {blocks.map((block) => {
          const status = getBlockStatus(block.id);
          return (
            <Button
              key={block.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 h-auto py-4 px-4 rounded-none",
                "hover:bg-muted/50 active:bg-muted transition-colors",
                status === "completed" && "bg-rest-block/5",
                status === "skipped" && "opacity-50"
              )}
              onClick={() => handleClick(block.id)}
            >
              {getStatusIcon(status)}
              <div className="flex-1 text-left min-w-0">
                <span className={cn(
                  "block text-sm font-medium truncate",
                  status === "skipped" && "line-through text-muted-foreground"
                )}>
                  {block.title}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {block.start_time} - {block.end_time}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Completion message */}
      {completed === total && total > 0 && (
        <div className="p-4 bg-rest-block/10 text-center animate-fade-in">
          <p className="text-sm font-semibold text-rest-block">
            Dia concluído! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
