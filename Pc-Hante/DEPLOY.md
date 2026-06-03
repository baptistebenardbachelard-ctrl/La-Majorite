# Deployer La Majorite

Le site utilise Supabase pour stocker les questions, votes, pseudos, reponses et classements.

## 1. Creer la base Supabase

1. Creer un projet Supabase.
2. Aller dans SQL Editor.
3. Executer `supabase/schema.sql`.
4. Executer `supabase/seed_questions.sql`.

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
/api/questions
/api/vote
/api/scores
/api/leaderboard
```

## Test local serveur classique

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
