-- ===========================================
-- LA MAILLE - Ajout du motif de rejet sur les generations
-- Permet de diagnostiquer pourquoi une photo est jugee non analysable
-- (ex: "ce n'est pas du tricot", "photo floue", "vetement pas assez visible").
-- Renseigne uniquement quand analysable = false (sinon NULL).
-- ===========================================

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
