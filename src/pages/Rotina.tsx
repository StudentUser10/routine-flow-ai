import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdjustments } from "@/hooks/useAdjustments";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, Settings, RefreshCw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { RoutineWeekView } from "@/components/routine/RoutineWeekView";
import { RoutineDayView } from "@/components/routine/RoutineDayView";
import { DailyChecklist } from "@/components/gamification/DailyChecklist";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { AdjustmentsRemaining } from "@/components/gamification/AdjustmentsRemaining";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
export interface RoutineBlock {
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

export interface Routine {
  id: string;
  user_id: string;
  week_start: string;
  is_active: boolean;
  version: number;
}

export default function Rotina() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { canAdjust, validateAndExecute, status: adjustmentStatus } = useAdjustments();
  const { initializeDayChecklist } = useGamification();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 0 });
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRoutine();
    }
  }, [user, currentWeekStart]);

  const fetchRoutine = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

      // Fetch active routine for current week
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStartStr)
        .eq("is_active", true)
        .maybeSingle();

      if (routineError) {
        console.error("Routine fetch error:", routineError);
        toast.error("Erro ao carregar rotina");
        setLoading(false);
        return;
      }

      if (!routineData) {
        // Check if user completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
          return;
        }

        // No routine for this week yet
        setRoutine(null);
        setBlocks([]);
        setLoading(false);
        return;
      }

      setRoutine(routineData);

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("routine_blocks")
        .select("*")
        .eq("routine_id", routineData.id)
        .order("start_time");

      if (blocksError) {
        console.error("Blocks fetch error:", blocksError);
        toast.error("Erro ao carregar blocos");
      } else {
        setBlocks(blocksData || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Validate adjustment before proceeding
    const result = await validateAndExecute(
      'regenerate',
      async () => {
        const { data: session } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-routine`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.session?.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao regenerar rotina");
        }

        return data;
      },
      routine?.id,
      'Regeneração de rotina'
    );

    if (result.success) {
      toast.success("Rotina regenerada com sucesso!");
      await fetchRoutine();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleBlockFeedback = async (blockId: string, worked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("routine_feedback").insert({
        block_id: blockId,
        user_id: user.id,
        worked,
      });

      if (error) throw error;

      toast.success(worked ? "Ótimo! Vamos manter assim." : "Entendido! Vamos ajustar.");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Erro ao salvar feedback");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const weekLabel = format(currentWeekStart, "'Semana de' dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">RotinAI</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Week navigation */}
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="font-display font-semibold capitalize">{weekLabel}</h2>
          
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="container px-4 py-6">
        {/* Gamification widgets - sidebar on desktop, top on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Gamification sidebar */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <DailyChecklist blocks={blocks} />
            <StreakDisplay />
            <AdjustmentsRemaining />
          </div>

          {/* Main routine content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {!routine ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">
                  Você ainda não tem uma rotina para esta semana.
                </p>
                <Button 
                  variant="hero" 
                  onClick={handleRegenerate} 
                  disabled={regenerating || !canAdjust}
                >
                  {regenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Gerar rotina
                    </>
                  )}
                </Button>
                {!canAdjust && (
                  <p className="text-sm text-destructive">
                    Limite de ajustes atingido. Faça upgrade para Pro.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* View toggle and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                    >
                      Semana
                    </Button>
                    <Button
                      variant={viewMode === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("day")}
                    >
                      Dia
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={regenerating || !canAdjust}
                    title={!canAdjust ? "Limite de ajustes atingido" : "Regenerar rotina"}
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Regenerar</span>
                  </Button>
                </div>

                {/* Routine view */}
                {viewMode === "week" ? (
                  <RoutineWeekView
                    blocks={blocks}
                    onBlockClick={(block) => {
                      setSelectedDay(block.day_of_week);
                      setViewMode("day");
                    }}
                  />
                ) : (
                  <RoutineDayView
                    blocks={blocks.filter((b) => b.day_of_week === selectedDay)}
                    selectedDay={selectedDay}
                    onDayChange={setSelectedDay}
                    onFeedback={handleBlockFeedback}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
