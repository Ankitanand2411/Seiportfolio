
-- Create a table to store shared portfolio replays
CREATE TABLE public.shared_replays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to shared_replays
ALTER TABLE public.shared_replays ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_replays
CREATE POLICY "Users can view public replays" 
  ON public.shared_replays 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own replays" 
  ON public.shared_replays 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replays" 
  ON public.shared_replays 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replays" 
  ON public.shared_replays 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION public.increment_replay_views(replay_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shared_replays 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = replay_id;
END;
$$;
