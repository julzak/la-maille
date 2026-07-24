# CLAUDE.md - Notes pour Claude Code

## Projet
La Maille - Application Next.js 14 pour générer des patrons de tricot à partir de photos.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, DB, Storage)
- Zustand (state management)
- Anthropic API (analyse d'images)

## Commandes importantes
```bash
npm run dev      # Serveur de développement
npm run build    # Build production (TOUJOURS exécuter avant de commit)
npm run lint     # Vérifier ESLint
```

## Leçons apprises

### 1. useTranslation() - Ne PAS utiliser `t` comme dépendance
La fonction `t` de `useTranslation()` est recréée à chaque render. Ne JAMAIS l'utiliser comme dépendance dans `useCallback` ou `useEffect`, sinon boucle infinie.

```typescript
// MAUVAIS - boucle infinie
const fetchData = useCallback(async () => {
  // ...
  toast.error(t("error"));
}, [t]); // ❌ `t` change à chaque render

// BON - effet exécuté une seule fois
useEffect(() => {
  async function fetchData() {
    // ...
    toast.error(t("error")); // OK d'utiliser t ici
  }
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Pas de dépendance sur t
```

### 2. TOUJOURS `npm run build` avant de commit
Le build vérifie :
- Erreurs TypeScript
- Erreurs ESLint (unused imports, unused vars)
- Traductions manquantes

Ne jamais push sans avoir vérifié que le build passe.

### 3. Traductions i18n
Quand tu ajoutes une nouvelle clé de traduction :
1. Ajouter dans `translations.fr` ET `translations.en` dans `lib/i18n.ts`
2. Les clés sont typées - TypeScript erreur si la clé n'existe pas

### 4. Types pour garment_type
Pour les types de vêtements dynamiques, utiliser un cast explicite :
```typescript
// BON
const key = `garment.${pattern.garment_type}` as "garment.pull" | "garment.cardigan" | "garment.gilet" | "garment.autre" | "garment.unknown";
const label = t(key);
```

### 5. API Routes avec Supabase Auth
Pattern pour vérifier l'authentification côté serveur :
```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
}
```

### 6. Modifier backend ET frontend ensemble
Quand tu ajoutes une nouvelle donnée (ex: neckband dans l'analyse) :
1. Ajouter dans le prompt API (`lib/anthropic.ts`)
2. Ajouter le type (`lib/types.ts`)
3. Ajouter dans le générateur (`lib/pattern-calculator.ts`)
4. **NE PAS OUBLIER** : Ajouter l'affichage UI (`app/analyse/page.tsx`, etc.)

Vérifier la chaîne complète : API → Types → Logique → UI

### 7. Prompt Anthropic - Ne pas confondre les concepts
Dans le prompt d'analyse d'image, être PRÉCIS sur les distinctions :
- "top-down" = méthode de construction (du haut vers le bas)
- "col intégré" = le col et le corps sont tricotés en continuité parfaite

Ces deux concepts sont INDÉPENDANTS ! La plupart des pulls top-down ont des mailles relevées pour le col.

### 8. Git commits multi-lignes
Ne PAS utiliser heredoc dans bash (erreurs de syntaxe). Utiliser plusieurs `-m` :
```bash
# BON
git commit -m "Titre" -m "Description ligne 1" -m "Co-Authored-By: ..."

# MAUVAIS - erreur de syntaxe
git commit -m "$(cat <<'EOF'
...
EOF
)"
```

## Structure des fichiers clés
- `lib/types.ts` - Types TypeScript
- `lib/i18n.ts` - Traductions FR/EN
- `lib/store.ts` - Zustand store
- `lib/supabase/server.ts` - Client Supabase serveur
- `lib/supabase/client.ts` - Client Supabase client
- `supabase-schema.sql` - Schema DB

## Coûts à surveiller
- **Anthropic API** : ~$0.01-0.05 par analyse d'image (limite configurée)
- Supabase/Vercel/Resend : free tier suffisant pour le moment

---

## Supabase migration 2026-04-18 → `jazzy-apps`

### Avant / Après

| Item | Source (SUPPRIMÉE ✅) | Cible |
|---|---|---|
| Projet Supabase | `la-maille` — ref `cecfgksbmdyzjvfhodur` — eu-west-1 | `jazzy-apps` — ref `vpmmobouujkknustjlho` — eu-central-1 |
| URL | `https://cecfgksbmdyzjvfhodur.supabase.co` | `https://vpmmobouujkknustjlho.supabase.co` |

### Changements
- **Schema public** : tables `profiles` + `saved_patterns`, fonctions `handle_new_user` + `handle_updated_at`, 7 RLS policies, FK vers `auth.users` — tout migré via `pg_dump --schema=public` nettoyé.
- **Auth** : `auth.users` (32) + `auth.identities` (33) migrés via `pg_dump` data-only avec `session_replication_role=replica`. **Hashes bcrypt préservés → aucun reset password nécessaire** pour les 23 users email. Les 9 users Google fonctionnent via identities migrées + même Client ID Google.
- **Trigger `on_auth_user_created`** sur `auth.users` recréé manuellement (n'était pas dans le dump `--schema=public`).
- **Edge function `welcome-email`** : redéployée sur jazzy-apps via `supabase functions deploy`. Secret `BREVO_API_KEY` re-set via `supabase secrets set`.
- **Webhook `welcome-email`** : bootstrap manuel sur jazzy-apps car le schéma `supabase_functions` n'existait pas (créé seulement à la 1ère webhook UI). Installés : extension `pg_net`, schéma `supabase_functions`, table `hooks`, fonction `http_request` (copie exacte du source). Trigger `AFTER INSERT ON public.profiles` avec URL + service_role de jazzy-apps.
- **Auth URL Configuration** (jazzy-apps) : Site URL = `https://la-maille.com` ; Redirect URLs = `https://la-maille.com/**` + `http://localhost:3000/**`.
- **Google OAuth** : même Client ID Google Cloud réutilisé ; redirect URI `https://vpmmobouujkknustjlho.supabase.co/auth/v1/callback` ajoutée dans Google Cloud Console + provider Google activé dans jazzy-apps Auth avec Client ID + Secret identiques.
- **Vercel env vars (production)** remplacées : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (seules vars Supabase côté Vercel).

### Suppression projet source
**FAIT** : projet source `la-maille` (`cecfgksbmdyzjvfhodur`) **supprimé** (vérifié 2026-06-26 : DNS NXDOMAIN). Plus de rollback auth possible (hashes bcrypt source perdus), conforme au plan initial. Migration close.

### Follow-up UX (out of migration scope)
- Template email "Confirm signup" Supabase = default moche → customiser dans jazzy-apps → Authentication → Email Templates
- Ou **désactiver** la confirmation email native Supabase et implémenter un double-opt-in custom via le welcome email Brevo (token stocké en `profiles.confirmation_token` + route `/confirm-email?token=xxx` côté Next.js).
