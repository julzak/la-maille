-- ===========================================
-- LA MAILLE - Rate limit /api/analyze (BRIEF-02)
-- A executer dans le SQL Editor de Supabase (projet jazzy-apps)
-- ===========================================

-- Ajoute une colonne ip_hash a generations pour compter les analyses
-- anonymes par IP sur une fenetre glissante de 24h. L'IP n'est jamais
-- stockee en clair : ip_hash = SHA-256 tronque de (IP + sel serveur),
-- calcule cote application (voir lib/rate-limit.ts, env IP_HASH_SALT).
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Index pour la requete de comptage (par ip_hash, sur les dernieres 24h).
CREATE INDEX IF NOT EXISTS generations_ip_hash_created_at_idx
  ON public.generations (ip_hash, created_at DESC);

-- ===========================================
-- ROLLBACK
-- ===========================================
-- DROP INDEX IF EXISTS public.generations_ip_hash_created_at_idx;
-- ALTER TABLE public.generations DROP COLUMN IF EXISTS ip_hash;
