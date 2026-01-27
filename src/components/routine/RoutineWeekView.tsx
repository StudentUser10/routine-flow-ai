import { RoutineBlock } from "@/pages/Rotina";

interface Props {
  blocks: RoutineBlock[];
  onBlockClick: (block: RoutineBlock) => void;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const BLOCK_COLORS = {
  focus: "bg-focus-block/20 border-focus-block text-focus-block",
  rest: "bg-rest-block/20 border-rest-block text-rest-block",
  personal: "bg-personal-block/20 border-personal-block text-personal-block",
  fixed: "bg-fixed-block/20 border-fixed-block text-fixed-block",
};

export function RoutineWeekView({ blocks, onBlockClick }: Props) {
  const today = new Date().getDay();

  const getBlocksForDay = (dayOfWeek: number) => {
    return blocks
      .filter((b) => b.day_of_week === dayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {DAYS.map((day, index) => (
        <div
          key={day}
          className={`text-center py-2 text-sm font-medium rounded-lg ${
            index === today
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {day}
        </div>
      ))}

      {/* Day columns */}
      {DAYS.map((_, dayIndex) => (
        <div key={dayIndex} className="min-h-[300px] space-y-1">
          {getBlocksForDay(dayIndex).map((block) => (
            <button
              key={block.id}
              onClick={() => onBlockClick(block)}
              className={`w-full p-2 rounded-lg border text-left transition-transform hover:scale-[1.02] ${
                BLOCK_COLORS[block.block_type]
              }`}
            >
              <p className="text-xs font-medium truncate">{block.title}</p>
              <p className="text-[10px] opacity-70">
                {block.start_time} - {block.end_time}
              </p>
            </button>
          ))}
          {getBlocksForDay(dayIndex).length === 0 && (
            <div className="h-20 border border-dashed border-border rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Vazio</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
