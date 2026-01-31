import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoutineBlock {
  day_of_week: number;
  block_type: "focus" | "rest" | "personal" | "fixed";
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_fixed: boolean;
  priority: number;
}

// Generic error messages for clients (no internal details exposed)
const CLIENT_ERRORS = {
  UNAUTHORIZED: "Não autorizado",
  ONBOARDING_REQUIRED: "Complete o onboarding primeiro",
  RATE_LIMITED: "Limite de requisições excedido. Tente novamente em alguns minutos.",
  CREDITS_EXHAUSTED: "Créditos de IA esgotados. Entre em contato com o suporte.",
  INTERNAL_ERROR: "Erro ao gerar rotina",
  MISSING_WEEK_START: "week_start é obrigatório no formato yyyy-MM-dd",
  INVALID_WEEK_START: "week_start deve estar no formato yyyy-MM-dd",
  GENERATION_LIMIT_REACHED: "Você atingiu o limite de gerações gratuitas deste mês. Faça upgrade para gerar novas rotinas.",
} as const;

// Free plan limit: 3 generations per month
const FREE_PLAN_MONTHLY_LIMIT = 3;

// Validate date format yyyy-MM-dd
const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Get first day of current month
const getFirstDayOfMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[GENERATE-ROUTINE] ERROR: Missing authorization header");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body to get week_start
    let body: { week_start?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body might be empty for backwards compatibility, will fail validation below
    }

    // REGRA ABSOLUTA: week_start é OBRIGATÓRIO
    const weekStartStr = body.week_start;
    
    if (!weekStartStr) {
      console.log("[GENERATE-ROUTINE] ERROR: Missing week_start in request body");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.MISSING_WEEK_START }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidDateFormat(weekStartStr)) {
      console.log("[GENERATE-ROUTINE] ERROR: Invalid week_start format:", weekStartStr);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_WEEK_START }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[GENERATE-ROUTINE] week_start received:", weekStartStr);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("[GENERATE-ROUTINE] User auth error:", userError?.message);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[GENERATE-ROUTINE] User authenticated:", user.id);

    // ============================================
    // REGRA: VERIFICAR LIMITE DE GERAÇÃO (PLANO FREE)
    // ============================================
    
    // Fetch user's plan from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("[GENERATE-ROUTINE] Profile fetch error:", profileError.message);
    }

    const userPlan = profile?.plan || 'free';
    console.log("[GENERATE-ROUTINE] User plan:", userPlan);

    // Only check limits for free plan
    if (userPlan === 'free') {
      const firstDayOfMonth = getFirstDayOfMonth();
      
      // Count generations this month
      const { count, error: countError } = await supabase
        .from("routine_generations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gte("created_at", firstDayOfMonth);

      if (countError) {
        console.error("[GENERATE-ROUTINE] Generation count error:", countError.message);
      }

      const generationsThisMonth = count || 0;
      console.log("[GENERATE-ROUTINE] Generations this month:", generationsThisMonth);

      // Check if this week was already generated (allow re-generation for same week)
      const { data: existingGeneration } = await supabase
        .from("routine_generations")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start", weekStartStr)
        .maybeSingle();

      // If limit reached and this is a NEW week (not re-generating same week)
      if (generationsThisMonth >= FREE_PLAN_MONTHLY_LIMIT && !existingGeneration) {
        console.log("[GENERATE-ROUTINE] FREE plan limit reached:", generationsThisMonth, ">=", FREE_PLAN_MONTHLY_LIMIT);
        return new Response(JSON.stringify({ 
          error: CLIENT_ERRORS.GENERATION_LIMIT_REACHED,
          upgrade_required: true,
          generations_used: generationsThisMonth,
          generations_limit: FREE_PLAN_MONTHLY_LIMIT
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get questionnaire data
    const { data: questionnaire, error: questError } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (questError || !questionnaire) {
      console.error("[GENERATE-ROUTINE] Questionnaire error:", questError?.message);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.ONBOARDING_REQUIRED }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[GENERATE-ROUTINE] LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um especialista em produtividade e gestão de tempo. Seu trabalho é criar rotinas semanais personalizadas e realistas baseadas na vida real do usuário.

REGRAS OBRIGATÓRIAS:
1. Nunca crie rotinas genéricas - use EXATAMENTE os dados fornecidos
2. Respeite SEMPRE os horários de acordar e dormir
3. Compromissos fixos são IMUTÁVEIS - nunca sugira alterá-los
4. Blocos de foco não podem exceder o limite definido pelo usuário
5. Insira pausas/descanso a cada 2-3 blocos de foco
6. Priorize as metas e prioridades do usuário
7. Considere o pico de energia para alocar tarefas importantes
8. Deixe tempo livre para imprevistos
9. Se o usuário NÃO tem trabalho fixo, crie uma rotina FLEXÍVEL baseada em metas e energia

TIPOS DE BLOCOS:
- focus: Trabalho profundo, estudo, projetos importantes
- rest: Pausas, descanso, lazer
- personal: Exercício, hobbies, família, autocuidado
- fixed: Compromissos imutáveis (trabalho, reuniões fixas)

Retorne APENAS um JSON válido com a estrutura:
{
  "blocks": [
    {
      "day_of_week": 0-6 (0=domingo),
      "block_type": "focus" | "rest" | "personal" | "fixed",
      "title": "Título curto",
      "description": "Descrição opcional",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "is_fixed": boolean,
      "priority": 1-5
    }
  ]
}`;

    // Handle users without fixed work
    const hasFixedWork = questionnaire.has_fixed_work ?? true;
    const workDays = questionnaire.work_days || [];
    
    let workInfo = "";
    if (hasFixedWork && questionnaire.work_hours) {
      if (workDays.length > 0) {
        const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const daysStr = workDays.map((wd: any) => dayNames[wd.day]).join(", ");
        workInfo = `- Trabalho fixo: Sim
- Dias de trabalho: ${daysStr}
- Horário de trabalho: ${questionnaire.work_hours}`;
      } else {
        workInfo = `- Trabalho fixo: Sim
- Horário de trabalho: ${questionnaire.work_hours}`;
      }
    } else {
      workInfo = `- Trabalho fixo: NÃO - Criar rotina flexível baseada em metas e energia do usuário`;
    }

    const userPrompt = `Crie uma rotina semanal completa para este usuário:

DADOS DO USUÁRIO:
- Acorda às: ${questionnaire.wake_time}
- Dorme às: ${questionnaire.sleep_time}
${workInfo}
- Pico de energia: ${questionnaire.energy_peak}
- Duração máxima de foco: ${questionnaire.focus_duration} minutos
- Metas principais: ${JSON.stringify(questionnaire.main_goals)}
- Prioridades: ${JSON.stringify(questionnaire.priorities)}
- Compromissos fixos: ${JSON.stringify(questionnaire.fixed_commitments)}

Crie blocos para TODOS os 7 dias da semana (0=domingo a 6=sábado), respeitando todas as regras.`;

    console.log("[GENERATE-ROUTINE] Calling Lovable AI...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[GENERATE-ROUTINE] AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.RATE_LIMITED }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.CREDITS_EXHAUSTED }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[GENERATE-ROUTINE] No content from AI");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[GENERATE-ROUTINE] AI Response received, parsing...");

    // Extract JSON from response
    let routineData: { blocks: RoutineBlock[] };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        routineData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found");
      }
    } catch (parseError) {
      console.error("[GENERATE-ROUTINE] Parse error:", parseError);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!routineData.blocks || !Array.isArray(routineData.blocks) || routineData.blocks.length === 0) {
      console.error("[GENERATE-ROUTINE] Empty routine returned");
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate time format (HH:MM) and logical order
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const parseTime = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    for (const block of routineData.blocks) {
      if (!timeRegex.test(block.start_time) || !timeRegex.test(block.end_time)) {
        console.error("[GENERATE-ROUTINE] Invalid time format in block:", block.title);
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (parseTime(block.end_time) <= parseTime(block.start_time)) {
        console.error("[GENERATE-ROUTINE] End time before start time:", block.title);
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (block.day_of_week < 0 || block.day_of_week > 6) {
        console.error("[GENERATE-ROUTINE] Invalid day_of_week:", block.day_of_week);
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log("[GENERATE-ROUTINE] All blocks validated successfully");

    // REGRA: Usar EXATAMENTE o week_start recebido do frontend
    console.log("[GENERATE-ROUTINE] Using week_start from frontend:", weekStartStr);

    // Check if routine already exists for this user and week
    const { data: existingRoutine } = await supabase
      .from("routines")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .maybeSingle();

    let routine;

    if (existingRoutine) {
      // Update existing routine
      console.log("[GENERATE-ROUTINE] Updating existing routine:", existingRoutine.id);
      
      // Delete existing blocks first
      await supabase
        .from("routine_blocks")
        .delete()
        .eq("routine_id", existingRoutine.id);

      // Update routine to be active
      const { data: updatedRoutine, error: updateError } = await supabase
        .from("routines")
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingRoutine.id)
        .select()
        .single();

      if (updateError) {
        console.error("[GENERATE-ROUTINE] Routine update error:", updateError.message);
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      routine = updatedRoutine;
    } else {
      // Create new routine
      console.log("[GENERATE-ROUTINE] Creating new routine for week:", weekStartStr);
      
      const { data: newRoutine, error: routineError } = await supabase
        .from("routines")
        .insert({
          user_id: user.id,
          week_start: weekStartStr,
          is_active: true,
          version: 1,
        })
        .select()
        .single();

      if (routineError) {
        console.error("[GENERATE-ROUTINE] Routine creation error:", routineError.message);
        return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      routine = newRoutine;
    }

    // Insert new blocks
    const blocksToInsert = routineData.blocks.map((block) => ({
      routine_id: routine.id,
      day_of_week: block.day_of_week,
      block_type: block.block_type,
      title: block.title,
      description: block.description || "",
      start_time: block.start_time,
      end_time: block.end_time,
      is_fixed: block.is_fixed || false,
      priority: block.priority || 1,
    }));

    const { error: blocksError } = await supabase
      .from("routine_blocks")
      .insert(blocksToInsert);

    if (blocksError) {
      console.error("[GENERATE-ROUTINE] Blocks insertion error:", blocksError.message);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // REGISTRAR GERAÇÃO NA TABELA routine_generations
    // ============================================
    // Use upsert to handle re-generations for same week
    const { error: genInsertError } = await supabase
      .from("routine_generations")
      .upsert({
        user_id: user.id,
        week_start: weekStartStr,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,week_start'
      });

    if (genInsertError) {
      console.error("[GENERATE-ROUTINE] Generation tracking error:", genInsertError.message);
      // Don't fail the whole operation for tracking error
    }

    // Update profile to mark onboarding as completed
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);

    console.log("[GENERATE-ROUTINE] Routine generated successfully for week:", weekStartStr, "with", blocksToInsert.length, "blocks");

    return new Response(JSON.stringify({ 
      success: true, 
      routine_id: routine.id,
      week_start: weekStartStr,
      blocks_count: blocksToInsert.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    // Log detailed error internally, return generic message to client
    console.error("[GENERATE-ROUTINE] Unexpected error:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: CLIENT_ERRORS.INTERNAL_ERROR }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
