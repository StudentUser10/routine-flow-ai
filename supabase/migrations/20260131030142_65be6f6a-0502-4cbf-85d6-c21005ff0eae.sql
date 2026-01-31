-- Add unique constraint on (user_id, week_start) to prevent duplicate routines per week
-- First, handle any potential duplicates by keeping only the most recent one
DELETE FROM public.routines r1
USING public.routines r2
WHERE r1.user_id = r2.user_id 
  AND r1.week_start = r2.week_start 
  AND r1.created_at < r2.created_at;

-- Now add the unique constraint
ALTER TABLE public.routines 
ADD CONSTRAINT routines_user_week_unique 
UNIQUE (user_id, week_start);