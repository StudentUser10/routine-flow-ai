-- Make routine_id nullable in routine_adjustments table
-- This is needed because when generating a routine for a new week,
-- there's no existing routine_id to reference

ALTER TABLE public.routine_adjustments 
ALTER COLUMN routine_id DROP NOT NULL;