import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Block {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  block_type: "focus" | "rest" | "personal" | "fixed";
  day_of_week: number;
}

interface UpcomingBlocksProps {
  blocks: Block[];
  selectedDay: number;
  maxBlocks?: number;
  className?: string;
}

const BLOCK_COLORS = {
  focus: "bg-focus-block/10 border-focus-block/30 text-focus-block",
  rest: "bg-rest-block/10 border-rest-block/30 text-rest-block",
  personal: "bg-personal-block/10 border-personal-block/30 text-personal-block",
  fixed: "bg-fixed-block/10 border-fixed-block/30 text-fixed-block",
};

const BLOCK_DOT_COLORS = {
  focus: "bg-focus-block",
  rest: "bg-rest-block",
  personal: "bg-personal-block",
  fixed: "bg-fixed-block",
};

export function UpcomingBlocks({ blocks, selectedDay, maxBlocks = 3, className }: UpcomingBlocksProps) {
  const now = new Date();
  const currentTime = format(now, "HH:mm");
  const isToday = selectedDay === now.getDay();

  // Get upcoming blocks (exclude current block if today)
  const upcomingBlocks = [...blocks]
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .filter(block => {
      if (!isToday) return true;
      // For today, filter out past and current blocks
      return block.start_time > currentTime;
    })
    .slice(0, maxBlocks);

  if (upcomingBlocks.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-display font-semibold text-sm text-muted-foreground px-1">
        Próximos Blocos
      </h3>
      
      <div className="space-y-2">
        {upcomingBlocks.map((block, index) => (
          <div
            key={block.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              "bg-card hover:bg-muted/30",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Color dot */}
            <div className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0",
              BLOCK_DOT_COLORS[block.block_type]
            )} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{block.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{block.start_time} - {block.end_time}</span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
