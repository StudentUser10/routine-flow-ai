-- Add missing DELETE policies for GDPR compliance and proper data management

-- Add DELETE policy for profiles table (GDPR Right to Erasure)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for routine_adjustments table
CREATE POLICY "Users can delete own routine adjustments"
ON public.routine_adjustments
FOR DELETE
USING (auth.uid() = user_id);