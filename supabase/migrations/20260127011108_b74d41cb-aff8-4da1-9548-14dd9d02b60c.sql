-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'annual');

-- Create enum for block types
CREATE TYPE public.block_type AS ENUM ('focus', 'rest', 'personal', 'fixed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'free',
  adjustments_used INTEGER NOT NULL DEFAULT 0,
  adjustments_limit INTEGER NOT NULL DEFAULT 3,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questionnaire_responses table
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  wake_time TEXT NOT NULL,
  sleep_time TEXT NOT NULL,
  work_hours TEXT NOT NULL,
  fixed_commitments JSONB NOT NULL DEFAULT '[]',
  main_goals JSONB NOT NULL DEFAULT '[]',
  energy_peak TEXT NOT NULL,
  focus_duration INTEGER NOT NULL,
  priorities JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Create routine_blocks table
CREATE TABLE public.routine_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  block_type block_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_fixed BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.routine_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.routine_blocks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  worked BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  block_id UUID REFERENCES public.routine_blocks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Questionnaire policies
CREATE POLICY "Users can view own questionnaire" ON public.questionnaire_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questionnaire" ON public.questionnaire_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaire" ON public.questionnaire_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Users can view own routines" ON public.routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON public.routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON public.routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON public.routines
  FOR DELETE USING (auth.uid() = user_id);

-- Routine blocks policies
CREATE POLICY "Users can view own blocks" ON public.routine_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_blocks.routine_id AND routines.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own blocks" ON public.routine_blocks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_blocks.routine_id AND routines.user_id = auth.uid())
  );

CREATE POLICY "Users can update own blocks" ON public.routine_blocks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_blocks.routine_id AND routines.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own blocks" ON public.routine_blocks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_blocks.routine_id AND routines.user_id = auth.uid())
  );

-- Feedback policies
CREATE POLICY "Users can view own feedback" ON public.routine_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.routine_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON public.alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaire_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();