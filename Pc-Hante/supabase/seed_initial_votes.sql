-- Remplit chaque question avec une petite base de votes de depart.
-- Les scores sont volontairement serres, par exemple 4/3, 6/8, 9/7.
-- Comme ca, quelques vrais joueurs peuvent vite redresser les pourcentages.
-- A lancer une seule fois apres schema.sql.
-- false = ajoute la base seulement aux questions qui n'ont pas encore de seed.
select public.seed_question_votes(false);

-- Si tu veux volontairement remplacer tous les votes par une nouvelle base,
-- utilise cette ligne a la place, mais attention: cela efface les votes reels visibles.
-- select public.seed_question_votes(true);
