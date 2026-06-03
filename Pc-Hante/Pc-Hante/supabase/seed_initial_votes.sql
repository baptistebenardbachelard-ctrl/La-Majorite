-- Remplit chaque question avec une base de votes de depart.
-- A lancer une seule fois apres schema.sql.
-- false = ajoute la base seulement aux questions qui n'ont pas encore de seed.
select public.seed_question_votes(false);

-- Si tu veux volontairement remplacer tous les votes par une nouvelle base,
-- utilise cette ligne a la place, mais attention: cela efface les votes reels visibles.
-- select public.seed_question_votes(true);
