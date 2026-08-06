-- ============================================
-- LA MAILLE - Tracking du prompt caching Anthropic
-- ============================================
-- Ajoute les compteurs de tokens de cache (cache_creation / cache_read)
-- renvoyes par l'API Anthropic sur chaque analyse, pour verifier les
-- hits du prompt caching en prod. Colonnes nullable : les generations
-- anterieures restent a NULL.

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS cache_creation_input_tokens integer,
  ADD COLUMN IF NOT EXISTS cache_read_input_tokens integer;

-- Rollback :
-- ALTER TABLE public.generations DROP COLUMN IF EXISTS cache_creation_input_tokens;
-- ALTER TABLE public.generations DROP COLUMN IF EXISTS cache_read_input_tokens;
