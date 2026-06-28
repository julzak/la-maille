-- ===========================================
-- LA MAILLE - Tracking des generations de patrons
-- A executer dans le SQL Editor de Supabase (projet jazzy-apps)
-- ===========================================

-- Chaque ligne = une analyse d'image lancee via /api/analyze.
-- analysable = true  -> vraie generation de patron
-- analysable = false -> photo rejetee (non tricot / illisible)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysable BOOLEAN NOT NULL,
  garment_type TEXT,
  num_images INT NOT NULL DEFAULT 1,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security : aucune insertion/lecture publique.
-- Les inserts passent uniquement par le service_role (cote serveur).
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Un utilisateur connecte peut consulter ses propres generations.
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index pour les requetes analytics (par date, par utilisateur).
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON public.generations (created_at DESC);
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations (user_id);
