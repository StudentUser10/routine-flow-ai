import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Stripe product IDs mapped to plans (TEST MODE)
const PRODUCT_TO_PLAN: Record<string, "pro" | "annual"> = {
  "prod_TtsBRwE1axiTgK": "pro",    // Pro Mensal (test)
  "prod_TtsC8IpZdr3DLZ": "annual", // Pro Anual (test)
};

// Generic error messages for clients (no internal details exposed)
const CLIENT_ERRORS = {
  UNAUTHORIZED: "Não autorizado",
  INTERNAL_ERROR: "Erro ao verificar assinatura",
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: Missing authorization header");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    // Use getClaims for JWT validation (doesn't require active session)
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("ERROR: Auth failed", { error: claimsError?.message });
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const claims = claimsData.claims;
    const userId = claims.sub as string;
    const userEmail = claims.email as string;
    
    if (!userEmail) {
      logStep("ERROR: No email in claims");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      
      // Update profile to free plan
      await supabaseClient
        .from("profiles")
        .update({ plan: "free" })
        .eq("user_id", userId);

      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan: "free" | "pro" | "annual" = "free";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0].price.product as string;
      plan = PRODUCT_TO_PLAN[productId] || "pro";
      logStep("Active subscription found", { plan });
    } else {
      logStep("No active subscription found");
    }

    // Update profile with current plan
    const updateData: { plan: string; adjustments_limit?: number } = { plan };
    if (plan !== "free") {
      updateData.adjustments_limit = 999999; // Unlimited for Pro users
    }
    
    await supabaseClient
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId);

    logStep("Profile updated with plan", { plan });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log detailed error internally, return generic message to client
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
