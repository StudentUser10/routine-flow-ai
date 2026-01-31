import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type AdjustmentSource = 'manual' | 'ai' | 're_onboarding' | 'regenerate';

interface AdjustmentResult<T> {
  success: boolean;
  result?: T;
  message?: string;
  blocked?: boolean;
}

/**
 * CAMADA ÚNICA DE EXECUÇÃO DE AJUSTES
 * 
 * REGRA ABSOLUTA: Nenhuma alteração de rotina pode acontecer sem passar por executeRoutineAdjustment.
 * 
 * Fluxo obrigatório:
 * 1. validate-adjustment (check)
 * 2. Se bloqueado → abortar
 * 3. Executar ação
 * 4. validate-adjustment (register)
 * 5. Se registro falhar → log de inconsistência
 */
export function useRoutineAdjustment() {
  const { session } = useAuth();
  const executingRef = useRef(false);

  /**
   * Executa um ajuste de rotina de forma segura e rastreável.
   * 
   * @param source - Origem do ajuste (manual, ai, re_onboarding, regenerate)
   * @param action - Função assíncrona que executa a ação
   * @param routineId - ID da rotina (opcional)
   * @param description - Descrição do ajuste para log
   */
  const executeRoutineAdjustment = useCallback(async <T,>(
    source: AdjustmentSource,
    action: () => Promise<T>,
    routineId?: string,
    description?: string
  ): Promise<AdjustmentResult<T>> => {
    // Guard contra execuções duplicadas rápidas
    if (executingRef.current) {
      console.warn('[ADJUSTMENT] Execução duplicada bloqueada');
      return { success: false, message: 'Aguarde a operação anterior', blocked: true };
    }

    if (!session?.access_token) {
      toast.error('Você precisa estar logado');
      return { success: false, message: 'Não autorizado' };
    }

    executingRef.current = true;

    try {
      // PASSO 1: Validar se pode fazer ajuste (check)
      console.log('[ADJUSTMENT] Verificando permissão...', { source });
      
      const { data: checkData, error: checkError } = await supabase.functions.invoke('validate-adjustment', {
        body: { action: 'check' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (checkError) {
        console.error('[ADJUSTMENT] Erro na verificação:', checkError);
        toast.error('Erro ao verificar permissão');
        return { success: false, message: 'Erro na verificação' };
      }

      // PASSO 2: Se bloqueado, abortar ANTES de executar qualquer ação
      if (!checkData?.canAdjust) {
        console.log('[ADJUSTMENT] Bloqueado - limite atingido');
        toast.error('Você atingiu o limite de gerações do seu plano. Faça upgrade para Pro.');
        return { 
          success: false, 
          message: 'Limite de gerações atingido',
          blocked: true 
        };
      }

      console.log('[ADJUSTMENT] Permissão concedida, executando ação...', { 
        remaining: checkData.remaining 
      });

      // PASSO 3: Executar a ação
      let result: T;
      try {
        result = await action();
      } catch (actionError) {
        console.error('[ADJUSTMENT] Erro na execução da ação:', actionError);
        toast.error('Erro ao gerar rotina');
        return { 
          success: false, 
          message: actionError instanceof Error ? actionError.message : 'Erro na execução' 
        };
      }

      // PASSO 4: Registrar o ajuste
      console.log('[ADJUSTMENT] Ação executada, registrando ajuste...');
      
      const { data: registerData, error: registerError } = await supabase.functions.invoke('validate-adjustment', {
        body: {
          action: 'register',
          source,
          routine_id: routineId,
          description: description || `Geração ${source}`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // PASSO 5: Fail-safe - Se registro falhar, logar inconsistência
      if (registerError || !registerData?.success) {
        console.error('[ADJUSTMENT] INCONSISTÊNCIA: Ação executada mas registro falhou!', {
          source,
          routineId,
          description,
          error: registerError,
          data: registerData,
        });
        
        // Logar no Supabase para auditoria (não bloqueia o usuário)
        await logAdjustmentInconsistency({
          user_id: session.user?.id,
          source,
          routine_id: routineId,
          description,
          error: registerError?.message || registerData?.error || 'Unknown',
        });

        // Mesmo com falha no registro, a ação foi executada
        toast.warning('Rotina gerada, mas houve um problema no registro. Entre em contato se o limite parecer incorreto.');
        return { success: true, result, message: 'Rotina gerada (registro parcial)' };
      }

      console.log('[ADJUSTMENT] Ajuste registrado com sucesso', {
        remaining: registerData.remaining,
      });

      return { 
        success: true, 
        result, 
        message: registerData.message 
      };

    } finally {
      executingRef.current = false;
    }
  }, [session?.access_token, session?.user?.id]);

  /**
   * Verifica se o usuário pode fazer ajustes sem executar nenhum
   */
  const checkCanAdjust = useCallback(async (): Promise<{
    canAdjust: boolean;
    remaining: number;
    limit: number;
    plan: string;
  } | null> => {
    if (!session?.access_token) return null;

    try {
      const { data, error } = await supabase.functions.invoke('validate-adjustment', {
        body: { action: 'check' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) return null;

      return {
        canAdjust: data.canAdjust,
        remaining: data.remaining,
        limit: data.adjustmentsLimit,
        plan: data.plan,
      };
    } catch {
      return null;
    }
  }, [session?.access_token]);

  return {
    executeRoutineAdjustment,
    checkCanAdjust,
  };
}

/**
 * Log de inconsistências para auditoria
 * Não expõe erros ao usuário, apenas registra para análise
 */
async function logAdjustmentInconsistency(data: {
  user_id?: string;
  source: string;
  routine_id?: string;
  description?: string;
  error: string;
}) {
  try {
    // Log no console para monitoramento
    console.error('[ADJUSTMENT_INCONSISTENCY_LOG]', {
      timestamp: new Date().toISOString(),
      ...data,
    });
    
    // Aqui poderia enviar para um serviço de logging externo
    // ou criar uma tabela de inconsistências no banco
  } catch {
    // Silencioso - não queremos erros de log afetando o usuário
  }
}
