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
ADMIN_TOKEN=un_long_mot_de_passe_admin
```

Important : utiliser la cle `service_role` uniquement dans les variables Netlify. Ne jamais la mettre dans le frontend.
`ADMIN_TOKEN` doit faire au moins 24 caracteres.

## 3. Redeployer

Netlify installera les dependances puis utilisera `netlify/functions/api.js` pour les routes :

```txt
/api/questions
/api/vote
/api/scores
/api/leaderboard
/api/admin/scores
```

## Admin

Apres redeploiement, ouvrir :

```txt
/admin.html
```

Entrer la valeur `ADMIN_TOKEN`.

Actions disponibles :

- voir les scores recents
- supprimer une partie test
- reset du classement
- reset complet votes + scores

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
