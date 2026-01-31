import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

const CLIENT_ERRORS = {
  UNAUTHORIZED: "Não autorizado",
  INTERNAL_ERROR: "Erro ao excluir conta",
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: Missing authorization header");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      logStep("ERROR: Auth failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // 1. Cancelar assinatura Stripe se existir
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey && user.email) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });

        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          logStep("Found Stripe customer", { customerId });

          // Cancelar todas as assinaturas ativas imediatamente
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
          });

          for (const subscription of subscriptions.data) {
            await stripe.subscriptions.cancel(subscription.id);
            logStep("Subscription cancelled", { subscriptionId: subscription.id });
          }
        }
      } catch (stripeError) {
        logStep("Stripe error (non-blocking)", { error: stripeError });
        // Não bloquear exclusão por erro do Stripe
      }
    }

    // 2. Deletar dados do usuário (em ordem para respeitar foreign keys)
    const userId = user.id;

    // Deletar alertas
    await supabaseClient.from("alerts").delete().eq("user_id", userId);
    logStep("Deleted alerts");

    // Deletar status de blocos
    await supabaseClient.from("block_status").delete().eq("user_id", userId);
    logStep("Deleted block_status");

    // Deletar feedback de rotina
    await supabaseClient.from("routine_feedback").delete().eq("user_id", userId);
    logStep("Deleted routine_feedback");

    // Deletar progresso diário
    await supabaseClient.from("daily_progress").delete().eq("user_id", userId);
    logStep("Deleted daily_progress");

    // Deletar gamificação
    await supabaseClient.from("user_gamification").delete().eq("user_id", userId);
    logStep("Deleted user_gamification");

    // Buscar rotinas do usuário
    const { data: routines } = await supabaseClient
      .from("routines")
      .select("id")
      .eq("user_id", userId);

    if (routines && routines.length > 0) {
      const routineIds = routines.map(r => r.id);

      // Deletar blocos de rotina
      await supabaseClient
        .from("routine_blocks")
        .delete()
        .in("routine_id", routineIds);
      logStep("Deleted routine_blocks");

      // Deletar ajustes de rotina
      await supabaseClient
        .from("routine_adjustments")
        .delete()
        .in("routine_id", routineIds);
      logStep("Deleted routine_adjustments");
    }

    // Deletar rotinas
    await supabaseClient.from("routines").delete().eq("user_id", userId);
    logStep("Deleted routines");

    // Deletar versões de onboarding
    await supabaseClient.from("onboarding_versions").delete().eq("user_id", userId);
    logStep("Deleted onboarding_versions");

    // Deletar respostas do questionário
    await supabaseClient.from("questionnaire_responses").delete().eq("user_id", userId);
    logStep("Deleted questionnaire_responses");

    // Deletar perfil
    await supabaseClient.from("profiles").delete().eq("user_id", userId);
    logStep("Deleted profile");

    // 3. Deletar usuário da autenticação
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      logStep("ERROR: Failed to delete auth user", { error: deleteUserError.message });
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("User deleted successfully");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Conta excluída com sucesso" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
