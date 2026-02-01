import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid Stripe price IDs - only these are allowed (LIVE MODE)
const VALID_PRICE_IDS = [
  "price_1Sw5ZFEvgf99HIdq9QLLd5WK", // Pro Mensal (live)
  "price_1Sw5ZbEvgf99HIdqSHu2MHsv", // Pro Anual (live)
] as const;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Generic error messages for clients (no internal details exposed)
const CLIENT_ERRORS = {
  INVALID_REQUEST: "Requisição inválida",
  UNAUTHORIZED: "Não autorizado",
  INTERNAL_ERROR: "Erro ao processar requisição",
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

    // Validate authorization first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: Missing authorization header");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Use getClaims for JWT validation (doesn't require user to exist in DB)
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

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logStep("ERROR: Invalid JSON body");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_REQUEST }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate priceId exists and is a string
    if (!body || typeof body !== "object" || !("priceId" in body)) {
      logStep("ERROR: Missing priceId");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_REQUEST }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { priceId } = body as { priceId: unknown };
    
    // Validate priceId is a valid Stripe price ID
    if (typeof priceId !== "string" || !VALID_PRICE_IDS.includes(priceId as typeof VALID_PRICE_IDS[number])) {
      logStep("ERROR: Invalid priceId", { priceId });
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_REQUEST }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Price ID validated", { priceId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create new");
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/planos?payment=cancelled`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
