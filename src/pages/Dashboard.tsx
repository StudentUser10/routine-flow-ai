import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, Sparkles, RotateCcw, Loader2, Crown, Settings } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { AdjustmentsIndicator } from "@/components/AdjustmentsIndicator";

interface Profile {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "annual";
  adjustments_used: number;
  adjustments_limit: number;
  onboarding_completed: boolean;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { plan, checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle payment success
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Pagamento confirmado com sucesso! Seu plano foi atualizado.');
      checkSubscription();
      // Clean URL
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, checkSubscription, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      setProfile(data);

      if (!data.onboarding_completed) {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";

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

          <div className="flex items-center gap-4">
            <PlanBadge />
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, {userName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {profile?.onboarding_completed ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Sua rotina está pronta
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                Bem-vindo de volta, {userName}!
              </h1>

              <p className="text-lg text-muted-foreground">
                Acesse sua rotina semanal ou refaça o onboarding para criar uma nova.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/rotina")}
                  className="gap-2"
                >
                  Ver minha rotina
                  <CalendarDays className="w-5 h-5" />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/onboarding")}
                  className="gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Ajustar minha rotina
                </Button>
              </div>

              {/* Plan info card */}
              <div className="p-6 bg-card border border-border rounded-xl mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan === 'free' ? (
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Crown className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-medium">
                      Plano {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Pro Anual'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/planos')}>
                    <Settings className="w-4 h-4 mr-2" />
                    {plan === 'free' ? 'Fazer upgrade' : 'Gerenciar'}
                  </Button>
                </div>

                <AdjustmentsIndicator />

                {plan === 'free' && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => navigate('/planos')}
                  >
                    <Crown className="w-4 h-4" />
                    Fazer upgrade para Pro
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Bem-vindo ao RotinAI
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                Vamos criar sua rotina perfeita
              </h1>

              <p className="text-lg text-muted-foreground">
                Você ainda não tem uma rotina configurada. Responda 8 perguntas simples 
                e nossa IA vai criar uma semana personalizada para você.
              </p>

              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding")}
                className="mx-auto gap-2"
              >
                Criar minha rotina automaticamente
                <Sparkles className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
