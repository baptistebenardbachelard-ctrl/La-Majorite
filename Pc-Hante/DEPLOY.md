# Deployer La Majorite

Le site utilise Supabase pour stocker les questions, votes, pseudos, reponses et classements.

## 1. Creer la base Supabase

1. Creer un projet Supabase.
2. Aller dans SQL Editor.
3. Executer `supabase/schema.sql`.
4. Executer `supabase/seed_questions.sql`.

Important : `seed_questions.sql` remet a zero les anciennes questions, les votes, les scores et l'XP des joueurs. Les pseudos/joueurs restent conserves.

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
/api/modes
/api/vote
/api/scores
/api/leaderboard?mode=global
/api/leaderboard?mode=today
/api/leaderboard?mode=streak
/api/leaderboard?mode=level
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
- modifier les questions et leur mode

## Modes de jeu

Le jeu contient 14 modes de 25 questions :

- Nourriture
- Films cultes
- Series
- Jeux video
- Musique
- Reseaux sociaux
- Amour
- Ecole / travail
- Vie quotidienne
- Super-pouvoirs
- Argent / luxe
- Impossible
- Genant
- Generation Internet

Quand un joueur termine un mode, ce mode est verrouille pour lui. Il doit choisir un autre mode pour rejouer.

## Classement des niveaux

Le classement contient aussi un onglet `Niveaux`. Il utilise la vue Supabase `leaderboard_level`, trie les joueurs par niveau, puis XP, puis nombre de modes termines.

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
