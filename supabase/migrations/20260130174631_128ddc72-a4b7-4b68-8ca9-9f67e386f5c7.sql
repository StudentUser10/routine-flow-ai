-- Add missing DELETE policy to alerts table
CREATE POLICY "Users can delete own alerts" 
ON public.alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add missing UPDATE policy to routine_feedback table
CREATE POLICY "Users can update own feedback" 
ON public.routine_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add missing DELETE policy to routine_feedback table
CREATE POLICY "Users can delete own feedback" 
ON public.routine_feedback 
FOR DELETE 
USING (auth.uid() = user_id);