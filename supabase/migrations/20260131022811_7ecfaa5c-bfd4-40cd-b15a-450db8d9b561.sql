-- Drop existing check constraint and add updated one with all valid sources
ALTER TABLE public.routine_adjustments DROP CONSTRAINT IF EXISTS routine_adjustments_source_check;

ALTER TABLE public.routine_adjustments ADD CONSTRAINT routine_adjustments_source_check 
CHECK (source IN ('manual', 'ai', 're_onboarding', 'regenerate'));