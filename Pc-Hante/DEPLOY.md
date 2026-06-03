# Deployer La Majorite

Le site utilise Supabase pour stocker les questions, votes, pseudos, reponses et classements.

## 1. Creer la base Supabase

1. Creer un projet Supabase.
2. Aller dans SQL Editor.
3. Executer `supabase/schema.sql` (inclut maintenant les politiques RLS pour l'acces public).
4. Executer `supabase/seed_questions.sql`.

**Important :** Le schema.sql contient desormais :
- Les politiques RLS (Row Level Security) pour l'acces en lecture sur toutes les tables
- Les fonctions RPC securisees `submit_vote` et `save_game_score`
- Les vues de classement `leaderboard_global` et `leaderboard_today`

## 2. Configurer Netlify

Dans Netlify, ajouter ces variables d'environnement :

```txt
SUPABASE_URL=https://TON-PROJET.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role
```

Important : utiliser la cle `service_role` uniquement dans les variables Netlify. Ne jamais la mettre dans le frontend.

## 3. Redeployer

Netlify installera les dependances puis utilisera `netlify/functions/api.js` pour les routes :

```txt
/api/questions       (GET)
/api/vote            (POST)
/api/scores          (POST)
/api/leaderboard     (GET)
/api/health          (GET)
```

**Améliorations de l'API :**
- Support complet des CORS preflight (OPTIONS)
- Gestion robuste des erreurs JSON
- Endpoint de sante (`/api/health`) pour la supervision

## 4. Test local serveur classique

```sh
npm start
```

Puis ouvrir :

```txt
http://127.0.0.1:5500
```

La route de sante pour l'hebergeur :

```txt
/healthz
```

## Depannage

**Les utilisateurs ne peuvent pas charger les questions ?**
- Verifier que `supabase/schema.sql` a ete execute (politiques RLS necessaires)
- Verifier les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Netlify

**Erreur "Vote invalide" ou "Question introuvable" ?**
- Verifier que les donnees de questions sont inserees avec `supabase/seed_questions.sql`
- Verifier que l'ID de la question existe dans la base

**Les classements ne s'affichent pas ?**
- Verifier que la vue `leaderboard_global` ou `leaderboard_today` existe
- Verifier qu'il y a au moins un score enregistre dans la base
