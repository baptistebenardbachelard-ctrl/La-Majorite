-- Mise a jour non destructive des questions pour la version beta 1.1.1.
-- A executer dans Supabase SQL Editor.

update public.questions
set
  question = 'Tu dois choisir ce que tu perds en ligne :',
  choice_a = 'Plus jamais regarder de memes',
  choice_b = 'Plus jamais regarder de videos courtes'
where id = 'internet_001';

update public.questions
set
  question = 'Tu dois choisir une limite sur les reseaux :',
  choice_a = 'Plus jamais poster de stories',
  choice_b = 'Plus jamais ecrire de commentaires'
where id = 'internet_012';
