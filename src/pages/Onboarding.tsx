import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { QuestionWakeTime } from "@/components/onboarding/QuestionWakeTime";
import { QuestionSleepTime } from "@/components/onboarding/QuestionSleepTime";
import { QuestionWorkHours } from "@/components/onboarding/QuestionWorkHours";
import { QuestionFixedCommitments } from "@/components/onboarding/QuestionFixedCommitments";
import { QuestionGoals } from "@/components/onboarding/QuestionGoals";
import { QuestionEnergyPeak } from "@/components/onboarding/QuestionEnergyPeak";
import { QuestionFocusDuration } from "@/components/onboarding/QuestionFocusDuration";
import { QuestionPriorities } from "@/components/onboarding/QuestionPriorities";

export interface OnboardingData {
  wakeTime: string;
  sleepTime: string;
  workHours: string;
  fixedCommitments: { day: number; start: string; end: string; title: string }[];
  mainGoals: string[];
  energyPeak: string;
  focusDuration: number;
  priorities: string[];
}

const TOTAL_QUESTIONS = 8;

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    wakeTime: "07:00",
    sleepTime: "23:00",
    workHours: "09:00-18:00",
    fixedCommitments: [],
    mainGoals: [],
    energyPeak: "morning",
    focusDuration: 60,
    priorities: [],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!data.wakeTime;
      case 2: return !!data.sleepTime;
      case 3: return !!data.workHours;
      case 4: return true; // Fixed commitments are optional
      case 5: return data.mainGoals.length > 0;
      case 6: return !!data.energyPeak;
      case 7: return data.focusDuration > 0;
      case 8: return data.priorities.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_QUESTIONS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Save questionnaire responses
      const { error: questError } = await supabase
        .from("questionnaire_responses")
        .upsert({
          user_id: user.id,
          wake_time: data.wakeTime,
          sleep_time: data.sleepTime,
          work_hours: data.workHours,
          fixed_commitments: data.fixedCommitments,
          main_goals: data.mainGoals,
          energy_peak: data.energyPeak,
          focus_duration: data.focusDuration,
          priorities: data.priorities,
        }, { onConflict: "user_id" });

      if (questError) {
        console.error("Questionnaire save error:", questError);
        toast.error("Erro ao salvar suas respostas. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Respostas salvas! Gerando sua rotina...");
      setIsGenerating(true);

      // Generate routine using AI
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao gerar rotina");
      }

      toast.success("Rotina gerada com sucesso!");
      navigate("/rotina");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const progress = (currentStep / TOTAL_QUESTIONS) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">RotinAI</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Pergunta {currentStep} de {TOTAL_QUESTIONS}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="border-b border-border">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Content */}
      <main className="container px-4 py-8 max-w-2xl mx-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
            <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">Gerando sua rotina...</h2>
              <p className="text-muted-foreground">
                Nossa IA está criando uma semana personalizada com base nas suas respostas.
              </p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Question content */}
            <div className="min-h-[300px]">
              {currentStep === 1 && (
                <QuestionWakeTime value={data.wakeTime} onChange={(v) => updateData("wakeTime", v)} />
              )}
              {currentStep === 2 && (
                <QuestionSleepTime value={data.sleepTime} onChange={(v) => updateData("sleepTime", v)} />
              )}
              {currentStep === 3 && (
                <QuestionWorkHours value={data.workHours} onChange={(v) => updateData("workHours", v)} />
              )}
              {currentStep === 4 && (
                <QuestionFixedCommitments
                  value={data.fixedCommitments}
                  onChange={(v) => updateData("fixedCommitments", v)}
                />
              )}
              {currentStep === 5 && (
                <QuestionGoals value={data.mainGoals} onChange={(v) => updateData("mainGoals", v)} />
              )}
              {currentStep === 6 && (
                <QuestionEnergyPeak value={data.energyPeak} onChange={(v) => updateData("energyPeak", v)} />
              )}
              {currentStep === 7 && (
                <QuestionFocusDuration
                  value={data.focusDuration}
                  onChange={(v) => updateData("focusDuration", v)}
                />
              )}
              {currentStep === 8 && (
                <QuestionPriorities value={data.priorities} onChange={(v) => updateData("priorities", v)} />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {currentStep < TOTAL_QUESTIONS ? (
                <Button
                  variant="hero"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Próxima
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      Gerar minha rotina
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
