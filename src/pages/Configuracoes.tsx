import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  ArrowLeft,
  User,
  CreditCard,
  Settings as SettingsIcon,
  AlertTriangle,
  Loader2,
  Crown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";

interface Profile {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "annual";
}

export default function Configuracoes() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { plan, subscribed, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);

  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

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
        return;
      }

      setProfile(data);
      setName(data.name || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      await fetchProfile();
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "EXCLUIR" || !deleteAcknowledged) return;

    setDeleting(true);
    try {
      // Se tem assinatura ativa, cancelar via Stripe
      if (subscribed) {
        toast.info("Cancelando assinatura...");
        // O cancelamento imediato é feito via portal ou edge function dedicada
        // Por segurança, usamos o customer-portal para cancelar
        // Mas para exclusão de conta, precisamos de uma edge function específica
      }

      // Chamar edge function para deletar conta completamente
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
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
        throw new Error(result.error || "Erro ao excluir conta");
      }

      toast.success("Conta excluída com sucesso. Sentiremos sua falta!");
      
      // Fazer logout e redirecionar
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao excluir conta");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const canDelete = deleteConfirmText === "EXCLUIR" && deleteAcknowledged;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gradient-hero flex items-center justify-center">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl">Configurações</span>
            </div>
          </div>
          <PlanBadge />
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Conta */}
        <section className="p-4 sm:p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <User className="w-5 h-5" />
            Conta
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="h-12 bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado.
              </p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={saving || !name.trim()}
              className="w-full sm:w-auto h-12"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </section>

        {/* Assinatura */}
        <section className="p-4 sm:p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="w-5 h-5" />
            Assinatura
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {plan === "free" ? (
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Crown className="w-5 h-5 text-primary" />
              )}
              <div>
                <p className="font-medium">
                  Plano {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Pro Anual"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan === "free"
                    ? "3 ajustes por mês"
                    : "Ajustes ilimitados"}
                </p>
              </div>
            </div>
          </div>

          {plan === "free" ? (
            <Button 
              onClick={() => navigate("/planos")} 
              className="w-full h-12 gap-2"
            >
              <Crown className="w-4 h-4" />
              Fazer upgrade para Pro
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={openCustomerPortal}
              className="w-full h-12"
            >
              Gerenciar assinatura
            </Button>
          )}
        </section>

        {/* Preferências */}
        <section className="p-4 sm:p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <SettingsIcon className="w-5 h-5" />
            Preferências
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Alterne entre claro e escuro
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes de blocos
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="gamification">Gamificação</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar pontos, streak e níveis
                </p>
              </div>
              <Switch
                id="gamification"
                checked={gamificationEnabled}
                onCheckedChange={setGamificationEnabled}
              />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="p-4 sm:p-6 bg-destructive/5 border border-destructive/20 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </div>

          <p className="text-sm text-muted-foreground">
            Ações irreversíveis. Proceda com cuidado.
          </p>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full h-12 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </Button>
        </section>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir conta
            </DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Aviso de assinatura ativa */}
            {subscribed && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                <p className="font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Atenção
                </p>
                <p className="text-sm">
                  Você possui uma assinatura ativa.
                </p>
                <p className="text-sm">Ao excluir sua conta:</p>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sua assinatura será <strong>cancelada imediatamente</strong></li>
                  <li>Não haverá reembolso do tempo restante</li>
                  <li>Todos os seus dados serão apagados permanentemente</li>
                </ul>
              </div>
            )}

            {/* Checkbox de reconhecimento */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acknowledge"
                checked={deleteAcknowledged}
                onCheckedChange={(checked) => setDeleteAcknowledged(checked === true)}
              />
              <label
                htmlFor="acknowledge"
                className="text-sm leading-relaxed cursor-pointer"
              >
                Estou ciente de que esta ação é irreversível e que todos os meus dados, incluindo rotinas, progresso e assinatura, serão permanentemente excluídos.
              </label>
            </div>

            {/* Campo de confirmação */}
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Digite <strong>EXCLUIR</strong> para confirmar
              </Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                placeholder="EXCLUIR"
                className="h-12"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmText("");
                setDeleteAcknowledged(false);
              }}
              className="w-full sm:w-auto h-12"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!canDelete || deleting}
              className="w-full sm:w-auto h-12"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
