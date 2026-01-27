import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, Sparkles, Settings, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const navigate = useNavigate();
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
        // Profile might not exist yet for new users, will be created by trigger
        return;
      }

      setProfile(data);

      // Redirect to onboarding if not completed
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
                  variant="hero" 
                  size="xl" 
                  onClick={() => navigate("/rotina")}
                >
                  Ver minha rotina
                  <CalendarDays className="w-5 h-5" />
                </Button>

                <Button 
                  variant="outline" 
                  size="xl" 
                  onClick={() => navigate("/onboarding")}
                >
                  <RotateCcw className="w-5 h-5" />
                  Refazer onboarding
                </Button>
              </div>

              {/* Plan info */}
              <div className="p-4 bg-card border border-border rounded-lg mt-8">
                <p className="text-sm text-muted-foreground">
                  Plano: <span className="font-medium text-foreground capitalize">{profile.plan}</span>
                  {profile.plan === "free" && (
                    <span className="ml-2">
                      • Ajustes: {profile.adjustments_used}/{profile.adjustments_limit}
                    </span>
                  )}
                </p>
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
                variant="hero" 
                size="xl" 
                onClick={() => navigate("/onboarding")}
                className="mx-auto"
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
