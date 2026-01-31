import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-ADJUSTMENT] ${step}${detailsStr}`);
};

// Plan limits
const PLAN_LIMITS = {
  free: 3, // 3 adjustments per month
  pro: 999999, // Unlimited
  annual: 999999, // Unlimited
} as const;

interface ValidateRequest {
  action: "check" | "register";
  source?: "manual" | "ai" | "re_onboarding" | "regenerate";
  routine_id?: string;
  description?: string;
}

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado", canAdjust: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      logStep("ERROR: Auth failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Não autorizado", canAdjust: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Parse request body
    const body: ValidateRequest = await req.json();
    const { action, source, routine_id, description } = body;

    logStep("Request received", { action, source });

    // Get user's plan
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("plan")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      logStep("ERROR: Profile not found");
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado", canAdjust: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const plan = profile.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    logStep("User plan", { plan, limit });

    // Count adjustments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabaseClient
      .from("routine_adjustments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (countError) {
      logStep("ERROR: Count failed", { error: countError.message });
      return new Response(
        JSON.stringify({ error: "Erro ao verificar ajustes", canAdjust: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const adjustmentsUsed = count || 0;
    const remaining = Math.max(0, limit - adjustmentsUsed);
    const canAdjust = adjustmentsUsed < limit;

    logStep("Adjustments count", { adjustmentsUsed, remaining, canAdjust });

    // If just checking, return status
    if (action === "check") {
      return new Response(
        JSON.stringify({
          canAdjust,
          adjustmentsUsed,
          adjustmentsLimit: limit,
          remaining,
          plan,
          message: canAdjust 
            ? `Você tem ${remaining} ajuste(s) restante(s) este mês.`
            : "Você atingiu o limite de ajustes do seu plano. Faça upgrade para continuar.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If registering, validate first
    if (action === "register") {
      if (!canAdjust) {
        logStep("BLOCKED: Adjustment limit reached");
        return new Response(
          JSON.stringify({
            success: false,
            canAdjust: false,
            error: "Você atingiu o limite de ajustes do seu plano. Faça upgrade para Pro.",
            adjustmentsUsed,
            adjustmentsLimit: limit,
            remaining: 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      // Register the adjustment
      const { error: insertError } = await supabaseClient
        .from("routine_adjustments")
        .insert({
          user_id: userId,
          routine_id: routine_id || null,
          source: source || "manual",
          description: description || `Ajuste ${source || "manual"}`,
          changes: {},
        });

      if (insertError) {
        logStep("ERROR: Insert failed", { error: insertError.message });
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao registrar ajuste" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const newRemaining = remaining - 1;
      logStep("Adjustment registered", { newRemaining });

      return new Response(
        JSON.stringify({
          success: true,
          canAdjust: newRemaining > 0,
          adjustmentsUsed: adjustmentsUsed + 1,
          adjustmentsLimit: limit,
          remaining: newRemaining,
          message: `Ajuste registrado. ${newRemaining} ajuste(s) restante(s).`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Erro interno", canAdjust: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
