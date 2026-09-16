-- Relance J3 : email de relance envoyé 3 jours après l'inscription
-- (users créés, confirmés, jamais revenus). Fonction Edge relance-j3
-- appelée chaque jour à 8h UTC par pg_cron.

-- Table d'idempotence : un user n'est jamais relancé deux fois pour un même "kind".
create table if not exists public.relance_emails (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'j3',
  sent_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.relance_emails enable row level security;
-- Aucune policy : accessible uniquement via service_role (utilisé par la fonction Edge),
-- même logique que les autres tables écrites en service_role only du projet.

create extension if not exists pg_cron;

-- IMPORTANT (secret) : le header Authorization ci-dessous contient un placeholder,
-- __SERVICE_ROLE_KEY__, volontairement. Depuis le 2026-09-16 la valeur injectée
-- est le jeton dédié RELANCE_J3_TOKEN (secret Supabase, valeur aléatoire), pas la
-- clé service_role : la fonction accepte ce jeton ou la clé service_role injectée
-- par la plateforme. Aucun secret n'est committé dans ce fichier.
--
-- Après application de cette migration, la vraie valeur est injectée directement
-- en base par une commande SQL non versionnée (exécutée une seule fois, hors git) :
--
--   update cron.job
--   set command = replace(command, '__SERVICE_ROLE_KEY__', '<vraie clé service_role jazzy-apps>')
--   where jobname = 'relance-j3-daily';
--
-- Voir tasks/relance-j3-copy.md et la description de la PR feat/relance-j3 pour le
-- détail de cette étape post-migration.
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
