-- ===========================================
-- LA MAILLE - Analyse complete sur les generations
-- Stocke le JSON GarmentAnalysis renvoye par le modele (acceptes ET rejets)
-- pour savoir ce que recouvrent les types "autre" et mesurer la demande
-- par categorie avant d'elargir aux bonnets, echarpes et chaussettes.
-- Aucune donnee personnelle : description du vetement uniquement.
-- ===========================================

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS analysis JSONB;
