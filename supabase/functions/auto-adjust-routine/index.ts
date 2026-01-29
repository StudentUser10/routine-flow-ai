import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-ADJUST] ${step}${detailsStr}`);
};

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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get user profile to check plan and adjustments limit
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    // Check if user can make adjustments
    if (profile.plan === "free" && profile.adjustments_used >= profile.adjustments_limit) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Limite de ajustes atingido. Faça upgrade para Pro.",
        adjustments_remaining: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    logStep("User can make adjustments", { 
      plan: profile.plan, 
      used: profile.adjustments_used,
      limit: profile.adjustments_limit 
    });

    // Get negative feedback from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: negativeFeedback, error: feedbackError } = await supabaseClient
      .from("routine_feedback")
      .select(`
        *,
        routine_blocks (*)
      `)
      .eq("user_id", user.id)
      .eq("worked", false)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (feedbackError) {
      throw new Error(`Error fetching feedback: ${feedbackError.message}`);
    }

    if (!negativeFeedback || negativeFeedback.length === 0) {
      logStep("No negative feedback to process");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Nenhum ajuste necessário. Sua rotina está funcionando bem!",
        adjustments_made: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found negative feedback", { count: negativeFeedback.length });

    // Get the active routine
    const { data: routine, error: routineError } = await supabaseClient
      .from("routines")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (routineError || !routine) {
      throw new Error("No active routine found");
    }

    // Analyze patterns and make adjustments
    const adjustments: string[] = [];
    const blockUpdates: any[] = [];

    for (const feedback of negativeFeedback) {
      const block = feedback.routine_blocks;
      if (!block || block.is_fixed) continue; // Never adjust fixed blocks

      // Strategy: If a block didn't work, try moving it 30 minutes earlier or later
      const [hours, minutes] = block.start_time.split(":").map(Number);
      const newMinutes = minutes >= 30 ? 0 : 30;
      const newHours = minutes >= 30 ? hours + 1 : hours;
      
      if (newHours < 23) {
        const newStartTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        
        // Calculate new end time maintaining duration
        const [endHours, endMinutes] = block.end_time.split(":").map(Number);
        const durationMinutes = (endHours * 60 + endMinutes) - (hours * 60 + minutes);
        const newEndMinutes = newHours * 60 + newMinutes + durationMinutes;
        const newEndTime = `${String(Math.floor(newEndMinutes / 60)).padStart(2, '0')}:${String(newEndMinutes % 60).padStart(2, '0')}`;

        blockUpdates.push({
          id: block.id,
          start_time: newStartTime,
          end_time: newEndTime
        });

        adjustments.push(`Bloco "${block.title}" movido de ${block.start_time} para ${newStartTime}`);
      }
    }

    // Apply updates
    for (const update of blockUpdates) {
      await supabaseClient
        .from("routine_blocks")
        .update({ start_time: update.start_time, end_time: update.end_time })
        .eq("id", update.id);
    }

    // Increment adjustments used for free users
    if (profile.plan === "free") {
      await supabaseClient
        .from("profiles")
        .update({ adjustments_used: profile.adjustments_used + 1 })
        .eq("user_id", user.id);
    }

    logStep("Adjustments completed", { count: adjustments.length });

    return new Response(JSON.stringify({
      success: true,
      message: adjustments.length > 0 
        ? "Rotina ajustada com base no seu feedback!" 
        : "Nenhum ajuste necessário no momento.",
      adjustments_made: adjustments.length,
      adjustments,
      adjustments_remaining: profile.plan === "free" 
        ? Math.max(0, profile.adjustments_limit - profile.adjustments_used - 1)
        : "unlimited"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
