-- Relance J3 : email de relance envoye 3 jours apres l'inscription
-- (users crees, confirmes, jamais revenus). Fonction Edge relance-j3
-- appelee chaque jour a 8h UTC par pg_cron.

-- Table d'idempotence : un user n'est jamais relance deux fois pour un meme "kind".
create table if not exists public.relance_emails (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'j3',
  sent_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.relance_emails enable row level security;
-- Aucune policy : accessible uniquement via service_role (utilise par la fonction Edge),
-- meme logique que les autres tables ecrites en service_role only du projet.

create extension if not exists pg_cron;

-- IMPORTANT (secret) : le header Authorization ci-dessous contient un placeholder,
-- __SERVICE_ROLE_KEY__, volontairement. La vraie cle service_role de jazzy-apps
-- n'est JAMAIS committee dans ce fichier ni dans aucun fichier versionne.
--
-- Apres application de cette migration, la vraie valeur est injectee directement
-- en base par une commande SQL non versionnee (executee une seule fois, hors git) :
--
--   update cron.job
--   set command = replace(command, '__SERVICE_ROLE_KEY__', '<vraie cle service_role jazzy-apps>')
--   where jobname = 'relance-j3-daily';
--
-- Voir tasks/relance-j3-copy.md et la description de la PR feat/relance-j3 pour le
-- detail de cette etape post-migration.
select cron.schedule(
  'relance-j3-daily',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://vpmmobouujkknustjlho.supabase.co/functions/v1/relance-j3',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__'
    ),
    body := '{}'::jsonb
  );
  $$
);
