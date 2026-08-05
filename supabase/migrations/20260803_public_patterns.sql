-- ===========================================
-- LA MAILLE - Pages patrons publiques (BRIEF-03)
-- A executer dans le SQL Editor de Supabase (projet jazzy-apps)
-- ===========================================

-- Un patron sauvegarde peut devenir une page publique indexable
-- (/patron/p/[slug]) sur consentement explicite de son auteur.
-- is_public   : defaut false, jamais public sans action de l'utilisateur.
-- public_slug : slug lisible + suffixe aleatoire (ex : pull-raglan-col-rond-a1b2c3),
--               unique, genere cote serveur au moment de la publication.
ALTER TABLE public.saved_patterns
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.saved_patterns
  ADD COLUMN IF NOT EXISTS public_slug TEXT;

-- Unicite du slug (les NULL multiples restent autorises).
CREATE UNIQUE INDEX IF NOT EXISTS saved_patterns_public_slug_idx
  ON public.saved_patterns (public_slug)
  WHERE public_slug IS NOT NULL;

-- Lecture anonyme UNIQUEMENT sur les patrons explicitement publics.
-- Les policies existantes ne sont pas modifiees :
--   "Users can view own patterns"   (SELECT, auth.uid() = user_id)
--   "Users can insert own patterns" (INSERT)
--   "Users can update own patterns" (UPDATE)
--   "Users can delete own patterns" (DELETE)
-- Les policies SELECT etant permissives (OR), celle-ci ajoute seulement
-- l'acces public aux lignes is_public = true, sans rien retirer.
DROP POLICY IF EXISTS "Anyone can view public patterns" ON public.saved_patterns;
CREATE POLICY "Anyone can view public patterns" ON public.saved_patterns
  FOR SELECT
  USING (is_public = true);

-- ===========================================
-- ROLLBACK
-- ===========================================
-- DROP POLICY IF EXISTS "Anyone can view public patterns" ON public.saved_patterns;
-- DROP INDEX IF EXISTS public.saved_patterns_public_slug_idx;
-- ALTER TABLE public.saved_patterns DROP COLUMN IF EXISTS public_slug;
-- ALTER TABLE public.saved_patterns DROP COLUMN IF EXISTS is_public;
