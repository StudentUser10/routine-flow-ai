-- =============================================
-- FASE 1: Estrutura para Onboarding Flexível e Gamificação
-- =============================================

-- 1. Tabela para versões de onboarding (tracking de re-onboarding)
CREATE TABLE public.onboarding_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL CHECK (source IN ('initial', 're_onboarding')),
  responses JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabela para ajustes de rotina (rastreamento de mudanças)
CREATE TABLE public.routine_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ai', 'user', 're_onboarding', 'feedback')),
  description TEXT NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabela para progresso diário (checklist gamificado)
CREATE TABLE public.daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  blocks_total INTEGER NOT NULL DEFAULT 0,
  blocks_completed INTEGER NOT NULL DEFAULT 0,
  blocks_skipped INTEGER NOT NULL DEFAULT 0,
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  streak_maintained BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Tabela para status de blocos do dia (checklist items)
CREATE TABLE public.block_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  block_id UUID NOT NULL REFERENCES public.routine_blocks(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, block_id, date)
);

-- 5. Tabela para dados de gamificação do usuário
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'iniciante' CHECK (current_level IN ('iniciante', 'consistente', 'disciplinado', 'mestre')),
  streak_minimum_percentage INTEGER NOT NULL DEFAULT 70,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Adicionar coluna has_fixed_work ao questionnaire_responses
ALTER TABLE public.questionnaire_responses 
ADD COLUMN IF NOT EXISTS has_fixed_work BOOLEAN NOT NULL DEFAULT true;

-- 7. Adicionar coluna work_days ao questionnaire_responses (para múltiplos dias)
ALTER TABLE public.questionnaire_responses 
ADD COLUMN IF NOT EXISTS work_days JSONB NOT NULL DEFAULT '[]';

-- =============================================
-- RLS POLICIES
-- =============================================

-- Onboarding Versions
ALTER TABLE public.onboarding_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding versions" 
ON public.onboarding_versions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding versions" 
ON public.onboarding_versions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Routine Adjustments
ALTER TABLE public.routine_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routine adjustments" 
ON public.routine_adjustments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine adjustments" 
ON public.routine_adjustments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Daily Progress
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily progress" 
ON public.daily_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress" 
ON public.daily_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress" 
ON public.daily_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Block Status
ALTER TABLE public.block_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own block status" 
ON public.block_status FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own block status" 
ON public.block_status FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own block status" 
ON public.block_status FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own block status" 
ON public.block_status FOR DELETE 
USING (auth.uid() = user_id);

-- User Gamification
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification" 
ON public.user_gamification FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" 
ON public.user_gamification FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" 
ON public.user_gamification FOR UPDATE 
USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at em daily_progress
CREATE TRIGGER update_daily_progress_updated_at
BEFORE UPDATE ON public.daily_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em user_gamification
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_onboarding_versions_user_id ON public.onboarding_versions(user_id);
CREATE INDEX idx_routine_adjustments_routine_id ON public.routine_adjustments(routine_id);
CREATE INDEX idx_routine_adjustments_user_id ON public.routine_adjustments(user_id);
CREATE INDEX idx_daily_progress_user_date ON public.daily_progress(user_id, date);
CREATE INDEX idx_block_status_user_date ON public.block_status(user_id, date);
CREATE INDEX idx_block_status_block_id ON public.block_status(block_id);