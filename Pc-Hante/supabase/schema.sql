create extension if not exists pgcrypto;

create table if not exists public.questions (
  id text primary key,
  question text not null,
  choice_a text not null,
  choice_b text not null,
  votes_a integer not null default 0 check (votes_a >= 0),
  votes_b integer not null default 0 check (votes_b >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  question_id text not null references public.questions(id) on delete cascade,
  choice text not null check (choice in ('A', 'B')),
  majority_choice text check (majority_choice in ('A', 'B')),
  points integer not null default 0 check (points between 0 and 2),
  created_at timestamptz not null default now(),
  unique (game_id, question_id)
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null unique,
  pseudo text not null,
  pseudo_key text generated always as (lower(trim(pseudo))) stored,
  score integer not null check (score >= 0),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  success_rate numeric(5, 2) not null,
  title text not null,
  day date not null default ((timezone('Europe/Paris', now()))::date),
  created_at timestamptz not null default now()
);

create index if not exists votes_game_id_idx on public.votes (game_id);
create index if not exists scores_day_idx on public.scores (day);
create index if not exists scores_pseudo_key_idx on public.scores (pseudo_key);

alter table public.questions enable row level security;
alter table public.votes enable row level security;
alter table public.scores enable row level security;

-- RLS Policies for public read access and service role write access
create policy "Allow read access to questions" on public.questions
  for select using (true);

create policy "Allow read access to votes" on public.votes
  for select using (true);

create policy "Allow read access to scores" on public.scores
  for select using (true);

create or replace view public.leaderboard_global as
select
  pseudo_key,
  (array_agg(pseudo order by created_at desc))[1] as pseudo,
  count(*)::integer as games_played,
  sum(score)::integer as total_score,
  sum(correct)::integer as total_correct,
  sum(total)::integer as total_questions,
  round((sum(correct)::numeric / nullif(sum(total), 0)) * 100, 1) as success_rate,
  round(avg(score), 1) as average_score,
  max(success_rate) as best_game_percent,
  max(created_at) as last_played_at
from public.scores
group by pseudo_key
order by success_rate desc, games_played desc, total_correct desc, average_score desc, last_played_at asc;

create or replace view public.leaderboard_today as
select
  pseudo_key,
  (array_agg(pseudo order by created_at desc))[1] as pseudo,
  count(*)::integer as games_played,
  sum(score)::integer as total_score,
  sum(correct)::integer as total_correct,
  sum(total)::integer as total_questions,
  round((sum(correct)::numeric / nullif(sum(total), 0)) * 100, 1) as success_rate,
  round(avg(score), 1) as average_score,
  max(success_rate) as best_game_percent,
  max(created_at) as last_played_at
from public.scores
where day = ((timezone('Europe/Paris', now()))::date)
group by pseudo_key
order by success_rate desc, games_played desc, total_correct desc, average_score desc, last_played_at asc;

create or replace function public.submit_vote(
  p_game_id text,
  p_question_id text,
  p_choice text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_votes_a integer;
  v_votes_b integer;
  v_total integer;
  v_percent_a integer;
  v_percent_b integer;
  v_majority text;
  v_majority_percent integer;
  v_points integer := 0;
begin
  if nullif(trim(p_game_id), '') is null or nullif(trim(p_question_id), '') is null then
    raise exception 'Vote invalide.';
  end if;

  p_choice := upper(trim(p_choice));
  if p_choice not in ('A', 'B') then
    raise exception 'Choix invalide.';
  end if;

  perform 1 from public.questions where id = p_question_id for update;
  if not found then
    raise exception 'Question introuvable.';
  end if;

  insert into public.votes (game_id, question_id, choice)
  values (p_game_id, p_question_id, p_choice);

  update public.questions
  set
    votes_a = votes_a + case when p_choice = 'A' then 1 else 0 end,
    votes_b = votes_b + case when p_choice = 'B' then 1 else 0 end
  where id = p_question_id
  returning votes_a, votes_b into v_votes_a, v_votes_b;

  v_total := v_votes_a + v_votes_b;
  v_percent_a := round((v_votes_a::numeric / v_total) * 100)::integer;
  v_percent_b := 100 - v_percent_a;

  if v_votes_a > v_votes_b then
    v_majority := 'A';
    v_majority_percent := v_percent_a;
  elsif v_votes_b > v_votes_a then
    v_majority := 'B';
    v_majority_percent := v_percent_b;
  else
    v_majority := null;
    v_majority_percent := 50;
  end if;

  if v_majority is not null and p_choice = v_majority then
    if v_majority_percent between 51 and 55 then
      v_points := 2;
    else
      v_points := 1;
    end if;
  end if;

  update public.votes
  set majority_choice = v_majority, points = v_points
  where game_id = p_game_id and question_id = p_question_id;

  return jsonb_build_object(
    'questionId', p_question_id,
    'votesA', v_votes_a,
    'votesB', v_votes_b,
    'percentages', jsonb_build_object('A', v_percent_a, 'B', v_percent_b),
    'majorityChoice', v_majority,
    'isCorrect', v_points > 0,
    'points', v_points
  );
exception
  when unique_violation then
    raise exception 'Cette question a deja ete votee dans cette partie.';
end;
$$;

create or replace function public.save_game_score(
  p_game_id text,
  p_pseudo text,
  p_title text default 'Joueur de la majorite'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_correct integer;
  v_score integer;
  v_success_rate numeric(5, 2);
  v_entry public.scores%rowtype;
  v_rank integer;
begin
  if nullif(trim(p_game_id), '') is null or nullif(trim(p_pseudo), '') is null then
    raise exception 'Score invalide.';
  end if;

  select
    count(*)::integer,
    count(*) filter (where points > 0)::integer,
    coalesce(sum(points), 0)::integer
  into v_total, v_correct, v_score
  from public.votes
  where game_id = p_game_id;

  if v_total <> 25 then
    raise exception 'Termine les 25 questions avant d''enregistrer ton score.';
  end if;

  v_success_rate := round((v_correct::numeric / v_total) * 100, 2);

  insert into public.scores (game_id, pseudo, score, correct, total, success_rate, title)
  values (
    p_game_id,
    left(trim(p_pseudo), 18),
    v_score,
    v_correct,
    v_total,
    v_success_rate,
    left(coalesce(nullif(trim(p_title), ''), 'Joueur de la majorite'), 40)
  )
  returning * into v_entry;

  select ranked.rank into v_rank
  from (
    select pseudo_key, row_number() over (
      order by success_rate desc, games_played desc, total_correct desc, average_score desc, last_played_at asc
    ) as rank
    from public.leaderboard_global
  ) ranked
  where ranked.pseudo_key = v_entry.pseudo_key;

  return jsonb_build_object(
    'entry', row_to_json(v_entry),
    'rank', v_rank
  );
exception
  when unique_violation then
    raise exception 'Score deja enregistre pour cette partie.';
end;
$$;
