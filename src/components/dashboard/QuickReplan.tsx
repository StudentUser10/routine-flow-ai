import { useState } from "react";
import { format, startOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRoutineAdjustment } from "@/hooks/useRoutineAdjustment";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { useNavigate } from "react-router-dom";

export function QuickReplan() {
    const { session } = useAuth();
    const { executeRoutineAdjustment, checkCanAdjust } = useRoutineAdjustment();
    const { canGenerate, plan, refetch: refetchGeneration } = useGenerationLimit();
    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReplan = async () => {
        if (!text.trim()) {
            toast.error("Digite o imprevisto para replanejar.");
            return;
        }

        // REGRA: Se plano Free e limite atingido, redirecionar para planos
        if (plan === 'free' && !canGenerate) {
            toast.error("Você atingiu o limite de gerações gratuitas deste mês.");
            navigate("/planos");
            return;
        }

        const canAdjustState = await checkCanAdjust();
        if (!canAdjustState?.canAdjust) {
            toast.error("Limite atingido. Faça upgrade para continuar ajustando sua rotina.");
            navigate("/planos");
            return;
        }

        setLoading(true);

        try {
            const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");

            const result = await executeRoutineAdjustment(
                'regenerate',
                async () => {
                    const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-routine`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                            body: JSON.stringify({
                                week_start: weekStartStr,
                                unforeseen_event: text.trim()
                            }),
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        if (data.upgrade_required) {
                            navigate("/planos");
                        }
                        throw new Error(data.error || "Erro ao replanejar rotina");
                    }

                    return data;
                },
                undefined,
                'Replanejamento por Imprevisto'
            );

            if (result.success) {
                toast.success("Rotina adaptada com sucesso!");
                setText("");
                await refetchGeneration();
                navigate("/rotina");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao adaptar rotina. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="col-span-1 shadow-soft border-border overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg font-display">Aconteceu um Imprevisto?</CardTitle>
                </div>
                <CardDescription>
                    Precisa mudar o escopo da semana ou arrumou um novo emprego? Conte para a IA.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Ex: Terei que ir ao médico hoje às 14h, libere minha tarde. Ou: Consegui um novo emprego fixo das 18h às 23h."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[100px] resize-none"
                />
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full gap-2"
                    onClick={handleReplan}
                    disabled={loading || !text.trim()}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {loading ? "Replanejando e aprendendo..." : "Replanejar com IA"}
                </Button>
            </CardFooter>
        </Card>
    );
}
