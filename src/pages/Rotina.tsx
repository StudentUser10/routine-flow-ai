import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoutineAdjustment } from "@/hooks/useRoutineAdjustment";
import { useGamification } from "@/hooks/useGamification";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, Settings, RefreshCw, Loader2, ChevronLeft, ChevronRight, Home, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { RoutineWeekView } from "@/components/routine/RoutineWeekView";
import { MobileRoutineView } from "@/components/routine/mobile/MobileRoutineView";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { executeRoutineAdjustment, checkCanAdjust } = useRoutineAdjustment();
  const { initializeDayChecklist } = useGamification();
  const { used, limit, canGenerate, plan, refetch: refetchGeneration, FREE_PLAN_MONTHLY_LIMIT } = useGenerationLimit();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [canAdjust, setCanAdjust] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRoutine();
      checkAdjustmentStatus();
    }
  }, [user, currentWeekStart]);

  const checkAdjustmentStatus = async () => {
    const status = await checkCanAdjust();
    setCanAdjust(status?.canAdjust ?? true);
  };

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
    // REGRA: Se plano Free e limite atingido, redirecionar para planos
    if (plan === 'free' && !canGenerate) {
      toast.error("Você atingiu o limite de gerações gratuitas deste mês.");
      navigate("/planos");
      return;
    }
    
    setRegenerating(true);
    
    // REGRA ABSOLUTA: Sempre enviar week_start explícito para o backend
    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
    
    // CAMADA ÚNICA DE AJUSTE - REGRA ABSOLUTA
    const result = await executeRoutineAdjustment(
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
            body: JSON.stringify({
              week_start: weekStartStr,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // REGRA: Verificar se é erro de limite de geração
          if (data.upgrade_required) {
            navigate("/planos");
          }
          throw new Error(data.error || "Erro ao regenerar rotina");
        }

        return data;
      },
      routine?.id,
      'Regeneração de rotina'
    );

    setRegenerating(false);

    if (result.success) {
      toast.success("Rotina regenerada com sucesso!");
      await fetchRoutine();
      await checkAdjustmentStatus();
      await refetchGeneration();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
    // REGRA: Mudou de semana → começa do início (domingo = 0)
    setSelectedDay(0);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
    // REGRA: Mudou de semana → começa do início (domingo = 0)
    setSelectedDay(0);
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
  
  // REGRA: Badge de limite de geração para plano Free
  const showGenerationBadge = plan === 'free';
  const generationLimitReached = plan === 'free' && !canGenerate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile optimized */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gradient-hero flex items-center justify-center">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl">RotinAI</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Badge de limite de geração */}
            {showGenerationBadge && (
              <div 
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  generationLimitReached 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => navigate("/planos")}
                title="Gerações de rotina este mês"
              >
                {generationLimitReached ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>{used}/{FREE_PLAN_MONTHLY_LIMIT}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/dashboard")}>
              <Home className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/configuracoes")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Week navigation - Mobile optimized */}
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-2 sm:py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handlePreviousWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="font-display font-semibold capitalize text-sm sm:text-base">{weekLabel}</h2>
          
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="container px-4 py-4 sm:py-6">
        {!routine ? (
          <div className="text-center py-8 sm:py-12 space-y-4">
            <p className="text-muted-foreground">
              Você ainda não tem uma rotina para esta semana.
            </p>
            
            {/* REGRA: Botão com estado de limite */}
            {generationLimitReached ? (
              <>
                <Button 
                  variant="hero" 
                  onClick={() => navigate("/planos")}
                  className="h-12 px-6"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Ver planos
                </Button>
                <p className="text-sm text-destructive">
                  🔒 Limite gratuito atingido ({used}/{FREE_PLAN_MONTHLY_LIMIT})
                </p>
                <p className="text-xs text-muted-foreground">
                  Gerações ilimitadas no plano Pro
                </p>
              </>
            ) : (
              <>
                <Button 
                  variant="hero" 
                  onClick={handleRegenerate} 
                  disabled={regenerating || !canAdjust}
                  className="h-12 px-6"
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
              </>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View - New WOW Experience */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Regenerate button for mobile with limit state */}
                <div className="flex items-center justify-end gap-2">
                  {showGenerationBadge && (
                    <span className="text-xs text-muted-foreground">
                      {generationLimitReached ? 'Limite atingido' : `${used}/${FREE_PLAN_MONTHLY_LIMIT}`}
                    </span>
                  )}
                  <Button
                    variant={generationLimitReached ? "outline" : "outline"}
                    size="sm"
                    className="h-9"
                    onClick={generationLimitReached ? () => navigate("/planos") : handleRegenerate}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : generationLimitReached ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <MobileRoutineView
                  blocks={blocks}
                  selectedDay={selectedDay}
                  onDayChange={setSelectedDay}
                />
              </div>
            ) : (
              /* Desktop View - Keep existing layout */
              <div className="space-y-6">
                {/* View toggle and actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      className="h-10 px-4"
                      onClick={() => setViewMode("week")}
                    >
                      Semana
                    </Button>
                    <Button
                      variant={viewMode === "day" ? "default" : "outline"}
                      className="h-10 px-4"
                      onClick={() => setViewMode("day")}
                    >
                      Dia
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Desktop generation limit badge */}
                    {showGenerationBadge && (
                      <div 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          generationLimitReached 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        onClick={() => navigate("/planos")}
                      >
                        {generationLimitReached ? <Lock className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        <span>{generationLimitReached ? 'Limite atingido' : `${used}/${FREE_PLAN_MONTHLY_LIMIT} gerações`}</span>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      className="h-10 px-4"
                      onClick={generationLimitReached ? () => navigate("/planos") : handleRegenerate}
                      disabled={regenerating}
                      title={generationLimitReached ? "Ver planos" : "Regenerar rotina"}
                    >
                      {regenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : generationLimitReached ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span className="ml-2">{generationLimitReached ? "Ver planos" : "Regenerar"}</span>
                    </Button>
                  </div>
                </div>

                {/* Routine view */}
                <RoutineWeekView
                  blocks={blocks}
                  onBlockClick={(block) => {
                    setSelectedDay(block.day_of_week);
                    setViewMode("day");
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
