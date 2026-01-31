-- Create table to track routine generations per user per month
CREATE TABLE public.routine_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient monthly queries
CREATE INDEX idx_routine_generations_user_month ON public.routine_generations 
  (user_id, created_at);

-- Unique constraint to prevent duplicate entries for same week
CREATE UNIQUE INDEX idx_routine_generations_user_week ON public.routine_generations 
  (user_id, week_start);

-- Enable RLS
ALTER TABLE public.routine_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own generations" 
ON public.routine_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" 
ON public.routine_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);