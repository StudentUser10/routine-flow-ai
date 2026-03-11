import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[KIRVANO-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const rawBody = await req.text();
    let body: Record<string, unknown> = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (_e) {
        logStep("WARNING: Failed to parse body as JSON");
      }
    }

    // --- Parse body ---------------------------------------------------------
    const event = body.event as string | undefined;
    const customer = body.customer as Record<string, unknown> | undefined;
    const customerEmail = customer?.email as string | undefined;

    if (!event || !customerEmail) {
      logStep("ERROR: Missing event or customer.email", { event, customerEmail });
      return new Response(
        JSON.stringify({ error: "Missing event or customer.email" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    logStep("Event received", { event, customerEmail });

    // --- Supabase client (service role) -------------------------------------
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // --- Handle events ------------------------------------------------------
    // Kirvano sends English event names:
    // SALE_APPROVED, SALE_REFUSED, REFUND, SUBSCRIPTION_CANCELED, CHARGEBACK
    switch (event) {
      case "SALE_APPROVED": {
        const plan_ = body.plan as Record<string, unknown> | undefined;
        const chargeFrequency = (plan_?.charge_frequency as string) ?? "";
        const plan = chargeFrequency === "ANNUALLY" ? "annual" : "pro";
        const adjustmentsLimit = 999999;

        const { error } = await supabaseClient
          .from("profiles")
          .update({ plan, adjustments_limit: adjustmentsLimit })
          .eq("email", customerEmail);

        if (error) {
          logStep("ERROR updating profile for SALE_APPROVED", { error: error.message });
          return new Response(JSON.stringify({ error: "Database error" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
        logStep("Profile upgraded", { plan, customerEmail });
        break;
      }

      case "SALE_REFUSED": {
        logStep("Purchase declined, no action taken", { customerEmail });
        break;
      }

      case "REFUND":
      case "SUBSCRIPTION_CANCELED":
      case "CHARGEBACK": {
        const { error } = await supabaseClient
          .from("profiles")
          .update({ plan: "free", adjustments_limit: 1, adjustments_used: 0 })
          .eq("email", customerEmail);

        if (error) {
          logStep("ERROR updating profile for downgrade", { error: error.message });
          return new Response(JSON.stringify({ error: "Database error" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
        logStep("Profile downgraded to free", { customerEmail });
        break;
      }

      default:
        logStep("Unknown event, ignored", { event });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
