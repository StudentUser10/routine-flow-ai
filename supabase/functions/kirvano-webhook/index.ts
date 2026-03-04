import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-kirvano-token",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[KIRVANO-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Map Kirvano events to internal plan updates.
 *
 * COMPRA_APROVADA   → activate the plan (pro or annual based on product)
 * COMPRA_RECUSADA   → no plan change (purchase failed)
 * REEMBOLSO         → downgrade to free
 * ASSINATURA_CANCELADA → downgrade to free
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // --- Developer Debug: log all incoming headers & body ---
    console.log('[KIRVANO-WEBHOOK] Headers:', JSON.stringify(Object.fromEntries(req.headers)));
    // We must read the body as text first to log it, then parse it manually
    const rawBody = await req.text();
    console.log('[KIRVANO-WEBHOOK] Body:', rawBody);

    // Parse it back for the rest of the function to use
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        logStep("WARNING: Failed to parse body as JSON");
      }
    }

    // --- Token validation ---------------------------------------------------
    const kirvanoToken = Deno.env.get("KIRVANO_TOKEN");
    if (!kirvanoToken) {
      logStep("ERROR: KIRVANO_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const incomingToken =
      req.headers.get("x-kirvano-token") ??
      req.headers.get("authorization")?.replace("Bearer ", "") ??
      (body as any).token;

    if (!incomingToken || incomingToken !== kirvanoToken) {
      logStep("ERROR: Invalid or missing token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Token validated");

    // --- Parse body ---------------------------------------------------------
    // body is already parsed from rawBody above
    const event = body.event as string | undefined;
    const customerEmail = body.customer?.email as string | undefined;

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
    switch (event) {
      case "COMPRA_APROVADA": {
        // Determine plan from product info if available, default to "pro"
        const productName = (body.product?.name ?? "").toLowerCase();
        const plan = productName.includes("anual") ? "annual" : "pro";
        const adjustmentsLimit = 999999; // Unlimited for paid users

        const { error } = await supabaseClient
          .from("profiles")
          .update({ plan, adjustments_limit: adjustmentsLimit })
          .eq("email", customerEmail);

        if (error) {
          logStep("ERROR updating profile for COMPRA_APROVADA", { error: error.message });
          return new Response(JSON.stringify({ error: "Database error" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
        logStep("Profile upgraded", { plan, customerEmail });
        break;
      }

      case "COMPRA_RECUSADA": {
        logStep("Purchase declined, no action taken", { customerEmail });
        break;
      }

      case "REEMBOLSO":
      case "ASSINATURA_CANCELADA": {
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
