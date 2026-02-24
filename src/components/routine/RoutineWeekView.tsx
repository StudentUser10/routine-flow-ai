import { RoutineBlock } from "@/pages/Rotina";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  blocks: RoutineBlock[];
  onBlockClick: (block: RoutineBlock) => void;
  onBlockMove?: (blockId: string, toDayOfWeek: number) => void;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const BLOCK_COLORS = {
  focus: "bg-focus-block/20 border-focus-block text-focus-block",
  rest: "bg-rest-block/20 border-rest-block text-rest-block",
  personal: "bg-personal-block/20 border-personal-block text-personal-block",
  fixed: "bg-fixed-block/20 border-fixed-block text-fixed-block hover:opacity-100", // fixed are harder to see if disabled so keep opacity
};

// Draggable Block
function DraggableBlock({ block, onClick }: { block: RoutineBlock, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { block },
    // Only allow dragging if it's not a fixed block, though we can allow all. Just allow all for now.
    disabled: block.is_fixed
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click when dragging
        if (!isDragging) {
          onClick();
        }
      }}
      className={`relative w-full p-2 rounded-lg border text-left transition-transform hover:scale-[1.02] touch-none ${BLOCK_COLORS[block.block_type]
        } ${block.is_fixed ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <p className="text-xs font-medium truncate">{block.title}</p>
      <p className="text-[10px] opacity-70">
        {block.start_time} - {block.end_time}
      </p>
      {block.is_fixed && (
        <span className="absolute top-1 right-1 text-[8px] bg-background/50 px-1 rounded">Fixo</span>
      )}
    </button>
  );
}

// Droppable Column
function DroppableDayColumn({ dayIndex, children }: { dayIndex: number, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dayIndex}`,
    data: { dayIndex }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] space-y-1 p-1 rounded-lg transition-colors duration-200 ${isOver ? 'bg-primary/5 border border-primary/20 scale-[1.01]' : 'bg-transparent'
        }`}
    >
      {children}
    </div>
  );
}

export function RoutineWeekView({ blocks, onBlockClick, onBlockMove }: Props) {
  const today = new Date().getDay();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts, allows clicking
      },
    })
  );

  const getBlocksForDay = (dayOfWeek: number) => {
    return blocks
      .filter((b) => b.day_of_week === dayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.data.current && active.data.current) {
      const blockId = active.id as string;
      const toDayOfWeek = over.data.current.dayIndex as number;
      const block = active.data.current.block as RoutineBlock;

      // If dropped in a different day
      if (block.day_of_week !== toDayOfWeek) {
        if (onBlockMove) {
          onBlockMove(blockId, toDayOfWeek);
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center py-2 text-sm font-medium rounded-lg ${index === today
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {day}
          </div>
        ))}

        {/* Day columns */}
        {DAYS.map((_, dayIndex) => {
          const dayBlocks = getBlocksForDay(dayIndex);

          return (
            <DroppableDayColumn key={dayIndex} dayIndex={dayIndex}>
              {dayBlocks.map((block) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  onClick={() => onBlockClick(block)}
                />
              ))}
              {dayBlocks.length === 0 && (
                <div className="h-20 border border-dashed border-border rounded-lg flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground">Arraste para cá</span>
                </div>
              )}
            </DroppableDayColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
