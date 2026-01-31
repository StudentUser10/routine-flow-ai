import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HeroCard } from "./HeroCard";
import { MobileDailyChecklist } from "./MobileDailyChecklist";
import { UpcomingBlocks } from "./UpcomingBlocks";
import { FullRoutineSheet } from "./FullRoutineSheet";
import { Confetti } from "./Confetti";
import { useGamification, BlockStatusType } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Block {
  id: string;
  routine_id: string;
  day_of_week: number;
  block_type: "focus" | "rest" | "personal" | "fixed";
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_fixed: boolean;
  priority: number;
}

interface MobileRoutineViewProps {
  blocks: Block[];
  selectedDay: number;
  onDayChange: (day: number) => void;
}

const SHORT_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// REGRA TEMPORAL: Mensagem padrão
const TEMPORAL_BLOCK_MESSAGE = "Você só pode concluir blocos do dia atual.";

export function MobileRoutineView({ blocks, selectedDay, onDayChange }: MobileRoutineViewProps) {
  const { 
    dailyProgress, 
    gamification,
    initializeDayChecklist, 
    updateBlockStatus, 
    getBlockStatus,
    isBlockFromToday,
    loading 
  } = useGamification();

  const [showConfetti, setShowConfetti] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(0);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get today's blocks
  const todayDayOfWeek = new Date().getDay();
  const todaysBlocks = blocks.filter(b => b.day_of_week === todayDayOfWeek);
  const selectedDayBlocks = blocks.filter(b => b.day_of_week === selectedDay);

  // REGRA TEMPORAL: Verificar se o dia selecionado é hoje
  const isSelectedDayToday = selectedDay === todayDayOfWeek;

  // Initialize checklist for today
  useEffect(() => {
    if (todaysBlocks.length > 0 && !loading) {
      initializeDayChecklist(todaysBlocks);
    }
  }, [todaysBlocks.length, loading]);

  // Progress values
  const progress = dailyProgress?.completion_percentage || 0;
  const completed = dailyProgress?.blocks_completed || 0;
  const total = dailyProgress?.blocks_total || todaysBlocks.length;
  const streak = gamification?.current_streak || 0;

  // Confetti trigger when all blocks completed
  useEffect(() => {
    if (completed > prevCompleted && completed === total && total > 0) {
      setShowConfetti(true);
    }
    setPrevCompleted(completed);
  }, [completed, total, prevCompleted]);

  // Handle status change with haptic feedback and temporal validation
  const handleStatusChange = useCallback(async (blockId: string, newStatus: BlockStatusType, dayOfWeek: number) => {
    // REGRA TEMPORAL: Bloquear conclusão fora do dia atual
    if (!isBlockFromToday(dayOfWeek)) {
      toast.error(TEMPORAL_BLOCK_MESSAGE);
      return;
    }

    // Haptic feedback
    if (navigator.vibrate && newStatus === "completed") {
      navigator.vibrate(30);
    }
    await updateBlockStatus(blockId, newStatus, dayOfWeek);
  }, [updateBlockStatus, isBlockFromToday]);

  // Handle complete from hero card
  const handleCompleteBlock = useCallback(async (blockId: string, dayOfWeek?: number) => {
    // REGRA TEMPORAL: Bloquear conclusão fora do dia atual
    const blockDay = dayOfWeek ?? selectedDay;
    if (!isBlockFromToday(blockDay)) {
      toast.error(TEMPORAL_BLOCK_MESSAGE);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 50]);
    }
    await updateBlockStatus(blockId, "completed", blockDay);
  }, [updateBlockStatus, selectedDay, isBlockFromToday]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      // Swipe left - next day
      onDayChange((selectedDay + 1) % 7);
    } else if (diff < -threshold) {
      // Swipe right - previous day
      onDayChange((selectedDay - 1 + 7) % 7);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="space-y-6 pb-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Confetti effect */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Day selector - compact */}
      <div className="flex justify-center gap-1.5">
        {SHORT_DAYS.map((day, index) => (
          <Button
            key={index}
            variant={selectedDay === index ? "default" : "ghost"}
            size="sm"
            onClick={() => onDayChange(index)}
            className={cn(
              "w-10 h-10 rounded-full p-0 text-sm font-medium transition-all",
              selectedDay === index && "shadow-md",
              index === todayDayOfWeek && selectedDay !== index && "ring-2 ring-primary/30"
            )}
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-xs text-muted-foreground text-center">
        Deslize para mudar de dia
      </p>

      {/* 1. HERO DO DIA - Always first */}
      <HeroCard 
        blocks={selectedDayBlocks}
        selectedDay={selectedDay}
        onCompleteBlock={(blockId) => handleCompleteBlock(blockId, selectedDay)}
        getBlockStatus={getBlockStatus}
        isToday={isSelectedDayToday}
      />

      {/* 2. CHECKLIST DO DIA - Show for selected day with temporal rules */}
      {selectedDayBlocks.length > 0 && (
        <MobileDailyChecklist
          blocks={selectedDayBlocks}
          streak={streak}
          progress={isSelectedDayToday ? progress : 0}
          completed={isSelectedDayToday ? completed : 0}
          total={isSelectedDayToday ? total : selectedDayBlocks.length}
          getBlockStatus={getBlockStatus}
          onStatusChange={handleStatusChange}
          isToday={isSelectedDayToday}
        />
      )}

      {/* 3. PRÓXIMOS BLOCOS - Max 3 */}
      <UpcomingBlocks 
        blocks={selectedDayBlocks}
        selectedDay={selectedDay}
        maxBlocks={3}
      />

      {/* 4. VER ROTINA COMPLETA - Bottom sheet */}
      {selectedDayBlocks.length > 0 && (
        <FullRoutineSheet 
          blocks={selectedDayBlocks}
          selectedDay={selectedDay}
        />
      )}
    </div>
  );
}
