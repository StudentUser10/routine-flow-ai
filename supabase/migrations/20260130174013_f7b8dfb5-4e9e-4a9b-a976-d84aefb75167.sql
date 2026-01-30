-- Update default adjustments_limit from 3 to 1 for free plan
ALTER TABLE public.profiles ALTER COLUMN adjustments_limit SET DEFAULT 1;

-- Update existing free users to have the new limit
UPDATE public.profiles SET adjustments_limit = 1 WHERE plan = 'free';