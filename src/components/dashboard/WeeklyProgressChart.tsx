import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatLocalDateKey } from "@/lib/date";

interface DailyProgress {
    date: string;
    completion_percentage: number;
}

export function WeeklyProgressChart() {
    const { user } = useAuth();
    const [data, setData] = useState<{ day: string; fullDate: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                setLoading(true);
                // Generate last 7 days keys
                const dates = Array.from({ length: 7 }).map((_, i) => {
                    const d = subDays(new Date(), 6 - i);
                    return formatLocalDateKey(d);
                });

                const { data: progressData, error } = await supabase
                    .from("daily_progress")
                    .select("date, completion_percentage")
                    .eq("user_id", user.id)
                    .in("date", dates);

                if (error) throw error;

                // Map the data
                const chartData = dates.map(dateStr => {
                    const found = progressData?.find(p => p.date === dateStr);
                    const dateObj = parseISO(dateStr);
                    return {
                        day: format(dateObj, "EEEEEE", { locale: ptBR }), // e.g. "seg"
                        fullDate: format(dateObj, "dd/MM", { locale: ptBR }),
                        value: found?.completion_percentage || 0
                    };
                });

                setData(chartData);
            } catch (err) {
                console.error("Error fetching progress chart data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <Card className="col-span-1 shadow-sm border-border overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">Produtividade da Semana</CardTitle>
                    <CardDescription>Carregando seus dados...</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 shadow-soft border-border overflow-hidden group hover:shadow-medium transition-shadow duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex justify-between items-center">
                    Produtividade Semanal
                    <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                        Últimos 7 dias
                    </span>
                </CardTitle>
                <CardDescription>Sua taxa de conclusão de blocos de rotina</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            dy={10}
                            className="capitalize"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))'
                            }}
                            labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 500 }}
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0) {
                                    return payload[0].payload.fullDate;
                                }
                                return label;
                            }}
                            formatter={(value: number) => [`${value}% concluído`, "Progresso"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
