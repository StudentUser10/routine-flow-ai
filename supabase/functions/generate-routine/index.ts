import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionnaireData {
  wake_time: string;
  sleep_time: string;
  work_hours: string;
  fixed_commitments: { day: number; start: string; end: string; title: string }[];
  main_goals: string[];
  energy_peak: string;
  focus_duration: number;
  priorities: string[];
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get questionnaire data
    const { data: questionnaire, error: questError } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (questError || !questionnaire) {
      console.error("Questionnaire error:", questError);
      return new Response(JSON.stringify({ error: "Complete o onboarding primeiro" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
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

    const userPrompt = `Crie uma rotina semanal completa para este usuário:

DADOS DO USUÁRIO:
- Acorda às: ${questionnaire.wake_time}
- Dorme às: ${questionnaire.sleep_time}
- Horário de trabalho: ${questionnaire.work_hours}
- Pico de energia: ${questionnaire.energy_peak}
- Duração máxima de foco: ${questionnaire.focus_duration} minutos
- Metas principais: ${JSON.stringify(questionnaire.main_goals)}
- Prioridades: ${JSON.stringify(questionnaire.priorities)}
- Compromissos fixos: ${JSON.stringify(questionnaire.fixed_commitments)}

Crie blocos para TODOS os 7 dias da semana (0=domingo a 6=sábado), respeitando todas as regras.`;

    console.log("Calling Lovable AI to generate routine...");

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
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content from AI:", aiData);
      throw new Error("IA não retornou conteúdo");
    }

    console.log("AI Response received, parsing...");

    // Extract JSON from response
    let routineData: { blocks: RoutineBlock[] };
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        routineData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      throw new Error("Falha ao processar resposta da IA");
    }

    if (!routineData.blocks || !Array.isArray(routineData.blocks) || routineData.blocks.length === 0) {
      throw new Error("IA retornou rotina vazia");
    }

    // Calculate week start (current week's Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Deactivate any existing active routine for this user
    await supabase
      .from("routines")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Create new routine
    const { data: routine, error: routineError } = await supabase
      .from("routines")
      .upsert({
        user_id: user.id,
        week_start: weekStartStr,
        is_active: true,
        version: 1,
      }, { onConflict: "user_id,week_start" })
      .select()
      .single();

    if (routineError) {
      console.error("Routine creation error:", routineError);
      throw new Error("Falha ao criar rotina");
    }

    // Delete existing blocks for this routine
    await supabase
      .from("routine_blocks")
      .delete()
      .eq("routine_id", routine.id);

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
      console.error("Blocks insertion error:", blocksError);
      throw new Error("Falha ao salvar blocos da rotina");
    }

    // Update profile to mark onboarding as completed
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);

    console.log("Routine generated successfully with", blocksToInsert.length, "blocks");

    return new Response(JSON.stringify({ 
      success: true, 
      routine_id: routine.id,
      blocks_count: blocksToInsert.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate routine error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro ao gerar rotina" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
