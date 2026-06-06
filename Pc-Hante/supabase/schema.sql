create extension if not exists pgcrypto;

create table if not exists public.questions (
  id text primary key,
  category text not null default 'general',
  question text not null,
  choice_a text not null,
  choice_b text not null,
  votes_a integer not null default 0 check (votes_a >= 0),
  votes_b integer not null default 0 check (votes_b >= 0),
  seed_votes_a integer not null default 0 check (seed_votes_a >= 0),
  seed_votes_b integer not null default 0 check (seed_votes_b >= 0),
  created_at timestamptz not null default now()
);

alter table public.questions
  add column if not exists seed_votes_a integer not null default 0 check (seed_votes_a >= 0);

alter table public.questions
  add column if not exists seed_votes_b integer not null default 0 check (seed_votes_b >= 0);

alter table public.questions
  add column if not exists category text not null default 'general';

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
  mode text not null default 'general',
  pseudo text not null,
  pseudo_key text generated always as (lower(trim(pseudo))) stored,
  avatar text not null default 'avatar-1',
  score integer not null check (score >= 0),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  success_rate numeric(5, 2) not null,
  best_streak integer not null default 0 check (best_streak >= 0),
  title text not null,
  day date not null default ((timezone('Europe/Paris', now()))::date),
  created_at timestamptz not null default now()
);

alter table public.scores
  add column if not exists avatar text not null default 'avatar-1';

alter table public.scores
  add column if not exists best_streak integer not null default 0 check (best_streak >= 0);

alter table public.scores
  add column if not exists mode text not null default 'general';

create table if not exists public.blocked_pseudos (
  pseudo_key text primary key,
  pseudo text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key,
  pseudo text not null,
  pseudo_key text generated always as (lower(trim(pseudo))) stored unique,
  avatar text not null default 'avatar-1',
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.players
  add column if not exists xp integer not null default 0 check (xp >= 0);

alter table public.players
  add column if not exists level integer not null default 1 check (level >= 1);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  pseudo text not null,
  pseudo_key text generated always as (lower(trim(pseudo))) stored,
  avatar text not null default 'avatar-1',
  player_level integer not null default 1 check (player_level >= 1),
  message text not null check (char_length(trim(message)) between 1 and 240),
  reported boolean not null default false,
  report_reason text,
  reported_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.devblog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  pseudo text,
  pseudo_key text generated always as (lower(trim(coalesce(pseudo, '')))) stored,
  avatar text not null default 'avatar-1',
  message text not null check (char_length(trim(message)) between 3 and 1200),
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

alter table public.scores
  add column if not exists player_id uuid references public.players(id) on delete set null;

alter table public.chat_messages
  add column if not exists player_id uuid references public.players(id) on delete set null;

alter table public.chat_messages
  add column if not exists player_level integer not null default 1 check (player_level >= 1);

alter table public.chat_messages
  add column if not exists reported boolean not null default false;

alter table public.chat_messages
  add column if not exists report_reason text;

alter table public.chat_messages
  add column if not exists reported_at timestamptz;

create index if not exists devblog_posts_created_at_idx on public.devblog_posts (created_at desc);
create index if not exists feedback_messages_created_at_idx on public.feedback_messages (created_at desc);
create index if not exists feedback_messages_status_idx on public.feedback_messages (status, created_at desc);

create index if not exists votes_game_id_idx on public.votes (game_id);
create index if not exists questions_category_idx on public.questions (category);
create index if not exists scores_day_idx on public.scores (day);
create index if not exists scores_pseudo_key_idx on public.scores (pseudo_key);
create index if not exists scores_player_mode_idx on public.scores (player_id, mode);
create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);

alter table public.questions enable row level security;
alter table public.votes enable row level security;
alter table public.scores enable row level security;
alter table public.blocked_pseudos enable row level security;
alter table public.players enable row level security;
alter table public.chat_messages enable row level security;
alter table public.devblog_posts enable row level security;
alter table public.feedback_messages enable row level security;

drop view if exists public.leaderboard_level;
drop view if exists public.leaderboard_streak;
drop view if exists public.leaderboard_today;
drop view if exists public.leaderboard_global;

create or replace view public.leaderboard_global as
select
  s.pseudo_key,
  (array_agg(s.pseudo order by s.created_at desc))[1] as pseudo,
  (array_agg(s.avatar order by s.created_at desc))[1] as avatar,
  coalesce(max(p.level), 1)::integer as level,
  coalesce(max(p.xp), 0)::integer as xp,
  count(*)::integer as games_played,
  sum(s.score)::integer as total_score,
  sum(s.correct)::integer as total_correct,
  sum(s.total)::integer as total_questions,
  round((sum(s.correct)::numeric / nullif(sum(s.total), 0)) * 100, 1) as success_rate,
  round(avg(s.score), 1) as average_score,
  max(s.success_rate) as best_game_percent,
  max(s.best_streak)::integer as best_streak,
  coalesce((
    select count(*)::integer
    from public.votes v
    join public.scores sv on sv.game_id = v.game_id
    where sv.pseudo_key = s.pseudo_key
      and v.majority_choice is null
  ), 0)::integer as tie_votes,
  max(s.created_at) as last_played_at
from public.scores s
left join public.players p on p.pseudo_key = s.pseudo_key
group by s.pseudo_key
order by success_rate desc, games_played desc, total_correct desc, best_streak desc, average_score desc, last_played_at asc;

create or replace view public.leaderboard_today as
select
  s.pseudo_key,
  (array_agg(s.pseudo order by s.created_at desc))[1] as pseudo,
  (array_agg(s.avatar order by s.created_at desc))[1] as avatar,
  coalesce(max(p.level), 1)::integer as level,
  coalesce(max(p.xp), 0)::integer as xp,
  count(*)::integer as games_played,
  sum(s.score)::integer as total_score,
  sum(s.correct)::integer as total_correct,
  sum(s.total)::integer as total_questions,
  round((sum(s.correct)::numeric / nullif(sum(s.total), 0)) * 100, 1) as success_rate,
  round(avg(s.score), 1) as average_score,
  max(s.success_rate) as best_game_percent,
  max(s.best_streak)::integer as best_streak,
  coalesce((
    select count(*)::integer
    from public.votes v
    join public.scores sv on sv.game_id = v.game_id
    where sv.pseudo_key = s.pseudo_key
      and sv.day = ((timezone('Europe/Paris', now()))::date)
      and v.majority_choice is null
  ), 0)::integer as tie_votes,
  max(s.created_at) as last_played_at
from public.scores s
left join public.players p on p.pseudo_key = s.pseudo_key
where s.day = ((timezone('Europe/Paris', now()))::date)
group by s.pseudo_key
order by success_rate desc, games_played desc, total_correct desc, best_streak desc, average_score desc, last_played_at asc;

create or replace view public.leaderboard_streak as
select
  s.pseudo_key,
  (array_agg(s.pseudo order by s.best_streak desc, s.created_at desc))[1] as pseudo,
  (array_agg(s.avatar order by s.best_streak desc, s.created_at desc))[1] as avatar,
  coalesce(max(p.level), 1)::integer as level,
  coalesce(max(p.xp), 0)::integer as xp,
  count(*)::integer as games_played,
  sum(s.score)::integer as total_score,
  sum(s.correct)::integer as total_correct,
  sum(s.total)::integer as total_questions,
  round((sum(s.correct)::numeric / nullif(sum(s.total), 0)) * 100, 1) as success_rate,
  round(avg(s.score), 1) as average_score,
  max(s.success_rate) as best_game_percent,
  max(s.best_streak)::integer as best_streak,
  coalesce((
    select count(*)::integer
    from public.votes v
    join public.scores sv on sv.game_id = v.game_id
    where sv.pseudo_key = s.pseudo_key
      and v.majority_choice is null
  ), 0)::integer as tie_votes,
  max(s.created_at) as last_played_at
from public.scores s
left join public.players p on p.pseudo_key = s.pseudo_key
group by s.pseudo_key
order by best_streak desc, success_rate desc, games_played desc, last_played_at asc;

create or replace view public.leaderboard_level as
select
  p.pseudo_key,
  p.pseudo,
  p.avatar,
  p.level::integer as level,
  p.xp::integer as xp,
  coalesce(count(s.id), 0)::integer as games_played,
  coalesce(sum(s.score), 0)::integer as total_score,
  coalesce(sum(s.correct), 0)::integer as total_correct,
  coalesce(sum(s.total), 0)::integer as total_questions,
  coalesce(round((sum(s.correct)::numeric / nullif(sum(s.total), 0)) * 100, 1), 0) as success_rate,
  coalesce(round(avg(s.score), 1), 0) as average_score,
  coalesce(max(s.success_rate), 0) as best_game_percent,
  coalesce(max(s.best_streak), 0)::integer as best_streak,
  coalesce((
    select count(*)::integer
    from public.votes v
    join public.scores sv on sv.game_id = v.game_id
    where sv.player_id = p.id
      and v.majority_choice is null
  ), 0)::integer as tie_votes,
  max(coalesce(s.created_at, p.last_seen_at)) as last_played_at
from public.players p
left join public.scores s on s.player_id = p.id
group by p.id, p.pseudo_key, p.pseudo, p.avatar, p.level, p.xp
order by p.level desc, p.xp desc, games_played desc, success_rate desc, p.last_seen_at asc;

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

  if v_majority is null then
    v_points := 1;
  elsif p_choice = v_majority then
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

create or replace function public.level_for_xp(p_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(floor(sqrt(greatest(p_xp, 0)::numeric / 120))::integer + 1, 1);
$$;

create or replace function public.xp_for_level(p_level integer)
returns integer
language sql
immutable
as $$
  select greatest((greatest(p_level, 1) - 1) * (greatest(p_level, 1) - 1) * 120, 0);
$$;

create or replace function public.register_player(
  p_player_id text,
  p_pseudo text,
  p_avatar text default 'avatar-1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid;
  v_pseudo text;
  v_avatar text;
  v_existing public.players%rowtype;
  v_player public.players%rowtype;
begin
  if nullif(trim(p_player_id), '') is null or nullif(trim(p_pseudo), '') is null then
    raise exception 'Joueur invalide.';
  end if;

  v_player_id := p_player_id::uuid;
  v_pseudo := left(trim(p_pseudo), 18);
  v_avatar := left(coalesce(nullif(trim(p_avatar), ''), 'avatar-1'), 24);

  if exists (
    select 1 from public.blocked_pseudos where pseudo_key = lower(trim(v_pseudo))
  ) then
    raise exception 'Ce pseudo est bloque.';
  end if;

  select * into v_existing
  from public.players
  where id = v_player_id;

  if found then
    if v_existing.pseudo_key <> lower(trim(v_pseudo)) and exists (
      select 1 from public.players
      where pseudo_key = lower(trim(v_pseudo)) and id <> v_player_id
    ) then
      raise exception 'Ce pseudo est deja pris.';
    end if;

    update public.players
    set pseudo = v_pseudo, avatar = v_avatar, last_seen_at = now()
    where id = v_player_id
    returning * into v_player;
  else
    insert into public.players (id, pseudo, avatar)
    values (v_player_id, v_pseudo, v_avatar)
    returning * into v_player;
  end if;

  return jsonb_build_object(
    'playerId', v_player.id,
    'pseudo', v_player.pseudo,
    'avatar', v_player.avatar,
    'xp', v_player.xp,
    'level', v_player.level
  );
exception
  when unique_violation then
    raise exception 'Ce pseudo est deja pris.';
  when invalid_text_representation then
    raise exception 'Identifiant joueur invalide.';
end;
$$;

create or replace function public.save_game_score(
  p_game_id text,
  p_pseudo text,
  p_title text default 'Joueur de la majorite',
  p_avatar text default 'avatar-1',
  p_best_streak integer default 0,
  p_player_id text default null,
  p_mode text default 'general'
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
  v_games_played integer;
  v_best_streak integer;
  v_badges jsonb := '[]'::jsonb;
  v_player_id uuid;
  v_xp_gained integer;
  v_player public.players%rowtype;
  v_previous_xp integer := 0;
  v_previous_level integer := 1;
  v_mode text;
begin
  if nullif(trim(p_game_id), '') is null or nullif(trim(p_pseudo), '') is null then
    raise exception 'Score invalide.';
  end if;

  v_mode := lower(regexp_replace(trim(coalesce(nullif(p_mode, ''), 'general')), '[^a-z0-9_-]', '', 'g'));
  if v_mode = '' then
    v_mode := 'general';
  end if;

  if exists (
    select 1 from public.blocked_pseudos where pseudo_key = lower(trim(p_pseudo))
  ) then
    raise exception 'Ce pseudo est bloque.';
  end if;

  if nullif(trim(coalesce(p_player_id, '')), '') is not null then
    v_player_id := p_player_id::uuid;

    perform public.register_player(p_player_id, p_pseudo, p_avatar);
    select * into v_player from public.players where id = v_player_id for update;
    v_previous_xp := v_player.xp;
    v_previous_level := v_player.level;

    if exists (
      select 1
      from public.scores
      where player_id = v_player_id
        and mode = v_mode
    ) then
      raise exception 'Tu as deja termine ce mode. Choisis un autre mode.';
    end if;
  end if;

  select
    count(*)::integer,
    count(*) filter (where points > 0)::integer,
    coalesce(sum(points), 0)::integer
  into v_total, v_correct, v_score
  from public.votes
  join public.questions on questions.id = votes.question_id
  where votes.game_id = p_game_id
    and questions.category = v_mode;

  if v_total <> 25 then
    raise exception 'Termine les 25 questions avant d''enregistrer ton score.';
  end if;

  v_success_rate := round((v_correct::numeric / v_total) * 100, 2);

  insert into public.scores (game_id, mode, player_id, pseudo, avatar, score, correct, total, success_rate, best_streak, title)
  values (
    p_game_id,
    v_mode,
    v_player_id,
    left(trim(p_pseudo), 18),
    left(coalesce(nullif(trim(p_avatar), ''), 'avatar-1'), 24),
    v_score,
    v_correct,
    v_total,
    v_success_rate,
    greatest(coalesce(p_best_streak, 0), 0),
    left(coalesce(nullif(trim(p_title), ''), 'Joueur de la majorite'), 40)
  )
  returning * into v_entry;

  select count(*)::integer, max(best_streak)::integer
  into v_games_played, v_best_streak
  from public.scores
  where pseudo_key = v_entry.pseudo_key;

  if v_games_played = 1 then
    v_badges := v_badges || jsonb_build_array('first_game');
  end if;

  if v_games_played >= 10 then
    v_badges := v_badges || jsonb_build_array('ten_games');
  end if;

  if v_best_streak >= 5 then
    v_badges := v_badges || jsonb_build_array('streak_5');
  end if;

  v_xp_gained := 60 + (v_correct * 12) + (v_score * 6) + (greatest(coalesce(p_best_streak, 0), 0) * 8);

  if v_player_id is not null then
    update public.players
    set
      xp = xp + v_xp_gained,
      level = public.level_for_xp(xp + v_xp_gained),
      pseudo = left(trim(p_pseudo), 18),
      avatar = left(coalesce(nullif(trim(p_avatar), ''), 'avatar-1'), 24),
      last_seen_at = now()
    where id = v_player_id
    returning * into v_player;

    if v_player.level >= 5 then
      v_badges := v_badges || jsonb_build_array('level_5');
    end if;

    if v_player.level >= 10 then
      v_badges := v_badges || jsonb_build_array('level_10');
    end if;
  end if;

  select ranked.rank into v_rank
  from (
    select pseudo_key, row_number() over (
      order by success_rate desc, games_played desc, total_correct desc, best_streak desc, average_score desc, last_played_at asc
    ) as rank
    from public.leaderboard_global
  ) ranked
  where ranked.pseudo_key = v_entry.pseudo_key;

  return jsonb_build_object(
    'entry', row_to_json(v_entry),
    'rank', v_rank,
    'badges', v_badges,
    'playerStats', jsonb_build_object(
      'gamesPlayed', v_games_played,
      'bestStreak', v_best_streak,
      'xpGained', v_xp_gained,
      'previousXp', v_previous_xp,
      'previousLevel', v_previous_level,
      'xp', coalesce(v_player.xp, v_xp_gained),
      'level', coalesce(v_player.level, public.level_for_xp(v_xp_gained)),
      'currentLevelXp', public.xp_for_level(coalesce(v_player.level, public.level_for_xp(v_xp_gained))),
      'nextLevelXp', public.xp_for_level(coalesce(v_player.level, public.level_for_xp(v_xp_gained)) + 1)
    )
  );
exception
  when unique_violation then
    raise exception 'Score deja enregistre pour cette partie.';
  when invalid_text_representation then
    raise exception 'Identifiant joueur invalide.';
end;
$$;

create or replace function public.admin_reset_scores()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.scores;
  update public.players set xp = 0, level = 1;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_reset_all()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.scores;
  delete from public.votes;
  update public.players set xp = 0, level = 1;
  update public.questions
  set
    votes_a = seed_votes_a,
    votes_b = seed_votes_b;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_reset_question(
  p_question_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.questions
  set
    votes_a = seed_votes_a,
    votes_b = seed_votes_b
  where id = p_question_id;

  if not found then
    raise exception 'Question introuvable.';
  end if;

  delete from public.votes where question_id = p_question_id;

  return jsonb_build_object('ok', true, 'questionId', p_question_id);
end;
$$;

create or replace function public.seed_question_votes(
  p_replace_existing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  with generated as (
    select
      id,
      3 + ((('x' || substr(md5(id || ':base'), 1, 7))::bit(28)::int) % 5) as base_votes,
      1 + ((('x' || substr(md5(id || ':gap'), 1, 7))::bit(28)::int) % 2) as vote_gap,
      ((('x' || substr(md5(id || ':side'), 1, 7))::bit(28)::int) % 2) = 0 as a_is_majority
    from public.questions
  ),
  prepared as (
    select
      id,
      case
        when a_is_majority then base_votes + vote_gap
        else base_votes
      end as generated_a,
      case
        when a_is_majority then base_votes
        else base_votes + vote_gap
      end as generated_b
    from generated
  )
  update public.questions q
  set
    seed_votes_a = prepared.generated_a,
    seed_votes_b = prepared.generated_b,
    votes_a = case
      when p_replace_existing then prepared.generated_a
      when q.seed_votes_a = 0 and q.seed_votes_b = 0 then q.votes_a + prepared.generated_a
      else q.votes_a
    end,
    votes_b = case
      when p_replace_existing then prepared.generated_b
      when q.seed_votes_a = 0 and q.seed_votes_b = 0 then q.votes_b + prepared.generated_b
      else q.votes_b
    end
  from prepared
  where q.id = prepared.id;

  return jsonb_build_object(
    'ok', true,
    'questionsSeeded', (select count(*) from public.questions),
    'replaceExisting', p_replace_existing
  );
end;
$$;
