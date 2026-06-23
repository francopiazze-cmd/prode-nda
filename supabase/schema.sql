-- =============================================================
-- NDA Prode — Schema de base de datos
-- Correr una sola vez en Supabase SQL Editor.
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- profiles: datos del usuario que se registra
-- Vinculado 1:1 con auth.users de Supabase Auth.
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  province text,
  insurances text[] default '{}',
  referral_code text not null unique,
  referred_by uuid references public.profiles(id),
  marketing_consent boolean not null default false,
  consent_at timestamptz,
  -- Bonus "asegurado NDA": el usuario declara si es cliente,
  -- carga una patente, y el equipo de NDA valida manualmente
  -- desde Supabase Studio. Cuando nda_client_verified pasa a
  -- true, suma +20 puntos al leaderboard.
  is_nda_client boolean not null default false,
  nda_license_plate text,
  nda_client_verified boolean not null default false,
  nda_client_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profiles_referral_code_idx on public.profiles(referral_code);
create index if not exists profiles_referred_by_idx on public.profiles(referred_by);
create index if not exists profiles_nda_pending_idx
  on public.profiles(created_at)
  where is_nda_client = true and nda_client_verified = false;

-- -------------------------------------------------------------
-- teams: selecciones que juegan el Mundial
-- Se cargan automáticamente desde el sync con football-data.org.
-- -------------------------------------------------------------
create table if not exists public.teams (
  id integer primary key,
  name text not null,
  short_name text,
  tla text,
  crest_url text,
  group_letter text
);

-- -------------------------------------------------------------
-- matches: partidos del Mundial
-- Se sincronizan desde football-data.org.
-- stage: GROUP_STAGE | LAST_16 | QUARTER_FINALS | SEMI_FINALS | THIRD_PLACE | FINAL
-- status: SCHEDULED | LIVE | FINISHED | POSTPONED | CANCELED
-- -------------------------------------------------------------
create table if not exists public.matches (
  id integer primary key,
  utc_kickoff timestamptz not null,
  status text not null default 'SCHEDULED',
  stage text not null,
  group_letter text,
  home_team_id integer references public.teams(id),
  away_team_id integer references public.teams(id),
  home_team_name text,
  away_team_name text,
  home_score integer,
  away_score integer,
  scored_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists matches_kickoff_idx on public.matches(utc_kickoff);
create index if not exists matches_status_idx on public.matches(status);

-- -------------------------------------------------------------
-- predictions: pronósticos cargados por los usuarios
-- Un usuario puede tener un solo pronóstico por partido.
-- points_awarded: cuántos puntos otorgó este pronóstico una vez
-- terminado el partido (NULL si todavía no se calculó).
-- -------------------------------------------------------------
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id integer not null references public.matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0 and home_score <= 30),
  away_score integer not null check (away_score >= 0 and away_score <= 30),
  points_awarded integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, match_id)
);

create index if not exists predictions_user_idx on public.predictions(user_id);
create index if not exists predictions_match_idx on public.predictions(match_id);

-- -------------------------------------------------------------
-- referrals: log de referidos confirmados. Cada uno otorga +2 puntos
-- al referidor (hasta un máximo de 10 referidos = 20 puntos al
-- ranking principal). Los referidos por encima de ese tope siguen
-- contando para el ranking "Embajadores" (premio independiente).
-- -------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  bonus_awarded boolean not null default false,
  awarded_at timestamptz,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);

create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

-- =============================================================
-- Vista del leaderboard (NORMAL / en vivo)
-- Se calcula al momento: nunca queda desactualizada. (Antes era una
-- vista materializada que había que refrescar; ver
-- supabase/leaderboard-vista-en-vivo.sql para la migración.)
-- =============================================================

create or replace view public.leaderboard as
with prediction_stats as (
  select
    p.user_id,
    coalesce(sum(p.points_awarded), 0) as base_points,
    count(*) filter (where p.points_awarded = 5) as exact_hits,
    -- Desglose de rendimiento (público en el ranking).
    -- exacto = 5/10 · diferencia = 3/6 · ganador = 1/2 · errado = 0
    count(*) filter (where p.points_awarded in (5, 10)) as aciertos_exactos,
    count(*) filter (where p.points_awarded in (3, 6)) as aciertos_diferencia,
    count(*) filter (where p.points_awarded in (1, 2)) as aciertos_ganador,
    count(*) filter (where p.points_awarded = 0) as errados,
    count(*) as jugados,
    count(*) filter (
      where p.points_awarded >= 1
      and (m.home_team_name = 'Argentina' or m.away_team_name = 'Argentina')
    ) as argentina_hits
  from public.predictions p
  join public.matches m on m.id = p.match_id
  where m.status = 'FINISHED'
  group by p.user_id
),
pred_totals as (
  select user_id, count(*) as total_predicciones
  from public.predictions
  group by user_id
),
referral_bonus as (
  -- Cap a 10 referidos para el ranking principal (max 20 pts por este concepto).
  -- Igualmente trackeamos referral_count entero para el ranking "Embajadores".
  select
    referrer_id as user_id,
    count(*) as referral_count,
    least(count(*), 10) * 2 as bonus_points
  from public.referrals
  where bonus_awarded = true
  group by referrer_id
)
select
  pr.id as user_id,
  pr.full_name,
  pr.referral_code,
  pr.created_at as registered_at,
  coalesce(ps.base_points, 0)
    + coalesce(rb.bonus_points, 0)
    + case when pr.nda_client_verified then 20 else 0 end as total_points,
  coalesce(ps.base_points, 0) as prediction_points,
  coalesce(ps.exact_hits, 0) as exact_hits,
  coalesce(ps.aciertos_exactos, 0) as aciertos_exactos,
  coalesce(ps.aciertos_diferencia, 0) as aciertos_diferencia,
  coalesce(ps.aciertos_ganador, 0) as aciertos_ganador,
  coalesce(ps.errados, 0) as errados,
  coalesce(ps.jugados, 0) as jugados,
  coalesce(pt.total_predicciones, 0) as total_predicciones,
  coalesce(ps.argentina_hits, 0) as argentina_hits,
  coalesce(rb.bonus_points, 0) as referral_points,
  coalesce(rb.referral_count, 0) as referral_count,
  case when pr.nda_client_verified then 20 else 0 end as nda_bonus_points
from public.profiles pr
left join prediction_stats ps on ps.user_id = pr.id
left join pred_totals pt on pt.user_id = pr.id
left join referral_bonus rb on rb.user_id = pr.id;

grant select on public.leaderboard to anon, authenticated;

-- refresh_leaderboard quedó como no-op: la vista es normal (en vivo) y
-- siempre está actualizada. Se mantiene la función para no romper el
-- código que todavía la llama (score-runner).
create or replace function public.refresh_leaderboard()
returns void
language plpgsql
as $$
begin
  return;
end;
$$;

-- =============================================================
-- Función de scoring: calcula puntos para un pronóstico
-- =============================================================

create or replace function public.calculate_prediction_points(
  pred_home integer,
  pred_away integer,
  actual_home integer,
  actual_away integer,
  match_stage text
)
returns integer
language plpgsql
immutable
as $$
declare
  base_points integer := 0;
  pred_winner text;
  actual_winner text;
  pred_diff integer;
  actual_diff integer;
begin
  if pred_home is null or pred_away is null
     or actual_home is null or actual_away is null then
    return 0;
  end if;

  -- Resultado exacto: 5
  if pred_home = actual_home and pred_away = actual_away then
    base_points := 5;
  else
    -- Determinar ganador real y predicho
    if pred_home > pred_away then pred_winner := 'home';
    elsif pred_home < pred_away then pred_winner := 'away';
    else pred_winner := 'draw'; end if;

    if actual_home > actual_away then actual_winner := 'home';
    elsif actual_home < actual_away then actual_winner := 'away';
    else actual_winner := 'draw'; end if;

    if pred_winner = actual_winner then
      pred_diff := pred_home - pred_away;
      actual_diff := actual_home - actual_away;
      -- Acertar ganador + diferencia: 3
      if pred_diff = actual_diff then
        base_points := 3;
      else
        -- Solo ganador / empate: 1
        base_points := 1;
      end if;
    end if;
  end if;

  -- Bonus eliminatorias: x2 desde octavos en adelante.
  -- Los dieciseisavos (LAST_32, formato 2026) puntúan x1, igual que grupos.
  if match_stage in ('LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL') then
    base_points := base_points * 2;
  end if;

  return base_points;
end;
$$;

-- =============================================================
-- Trigger: cuando un usuario juega su primer pronóstico,
-- marca el referido como confirmado (+2 puntos al referidor, con
-- tope de 10 referidos premiados para el ranking principal).
-- =============================================================

create or replace function public.on_first_prediction()
returns trigger
language plpgsql
security definer
as $$
declare
  is_first_prediction boolean;
begin
  select count(*) = 1 into is_first_prediction
  from public.predictions
  where user_id = NEW.user_id;

  if is_first_prediction then
    update public.referrals
    set bonus_awarded = true, awarded_at = now()
    where referred_id = NEW.user_id and bonus_awarded = false;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_on_first_prediction on public.predictions;
create trigger trg_on_first_prediction
after insert on public.predictions
for each row execute function public.on_first_prediction();

-- =============================================================
-- Trigger: cuando se crea un profile con referred_by, registrar
-- el referido (sin otorgar bonus todavía).
-- =============================================================

create or replace function public.on_profile_created()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.referred_by is not null then
    insert into public.referrals(referrer_id, referred_id)
    values (NEW.referred_by, NEW.id)
    on conflict do nothing;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_on_profile_created on public.profiles;
create trigger trg_on_profile_created
after insert on public.profiles
for each row execute function public.on_profile_created();

-- =============================================================
-- Trigger: blindar los campos de verificación de asegurado NDA.
-- Solo el rol service_role (admin / scripts del backend) puede
-- modificar nda_client_verified y nda_client_verified_at.
-- Si la actualización viene del cliente (usuario autenticado),
-- esos campos se preservan al valor anterior.
-- =============================================================

create or replace function public.protect_nda_verification_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    NEW.nda_client_verified := OLD.nda_client_verified;
    NEW.nda_client_verified_at := OLD.nda_client_verified_at;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_protect_nda_verification on public.profiles;
create trigger trg_protect_nda_verification
  before update on public.profiles
  for each row execute function public.protect_nda_verification_fields();

-- =============================================================
-- Vista de utilidad para el admin: asegurados pendientes de validar.
-- Se consulta desde Supabase Studio (Table editor o SQL Editor).
-- =============================================================

create or replace view public.nda_pending_validation as
select
  id,
  full_name,
  email,
  phone,
  province,
  nda_license_plate,
  created_at
from public.profiles
where is_nda_client = true
  and nda_client_verified = false
order by created_at asc;

-- =============================================================
-- Generador de referral_code corto y único
-- =============================================================

create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
  exists_count integer;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    select count(*) into exists_count from public.profiles where referral_code = result;
    if exists_count = 0 then
      return result;
    end if;
  end loop;
end;
$$;

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.referrals enable row level security;
alter table public.matches enable row level security;
alter table public.teams enable row level security;

-- profiles: el usuario solo ve y edita su propio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_select_public_basic" on public.profiles;
create policy "profiles_select_public_basic" on public.profiles
  for select using (true);
-- Nota: para el leaderboard solo se exponen full_name y referral_code.
-- Si querés ocultar el resto del profile a otros usuarios, reemplazar
-- la política anterior por una vista con SECURITY INVOKER que filtre columnas.

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- predictions: el usuario solo ve y edita las suyas
drop policy if exists "predictions_select_own" on public.predictions;
create policy "predictions_select_own" on public.predictions
  for select using (auth.uid() = user_id);

drop policy if exists "predictions_insert_own" on public.predictions;
create policy "predictions_insert_own" on public.predictions
  for insert with check (auth.uid() = user_id);

drop policy if exists "predictions_update_own" on public.predictions;
create policy "predictions_update_own" on public.predictions
  for update using (auth.uid() = user_id);

-- referrals: el usuario ve los referidos que generó
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id);

-- matches y teams: lectura pública
drop policy if exists "matches_select_all" on public.matches;
create policy "matches_select_all" on public.matches for select using (true);

drop policy if exists "teams_select_all" on public.teams;
create policy "teams_select_all" on public.teams for select using (true);

-- =============================================================
-- ANTI-TRAMPA: bloqueo de pronósticos por horario (server-side)
-- =============================================================
-- Impide insertar o modificar un pronóstico una vez que el partido
-- arrancó (o está por arrancar). Usa now() del SERVIDOR de Postgres,
-- que es imposible de falsificar cambiando el reloj del celular.
--
-- Solo bloquea cambios al PRONÓSTICO (home_score/away_score). El
-- proceso de scoring, que actualiza points_awarded en partidos ya
-- terminados, no se ve afectado.
create or replace function public.enforce_prediction_lock()
returns trigger
language plpgsql
as $$
declare
  m record;
  lock_minutes constant int := 5;
begin
  -- En UPDATE, si el pronóstico no cambia (ej: scoring seteando
  -- points_awarded), permitir sin chequear el horario.
  if tg_op = 'UPDATE'
     and new.home_score is not distinct from old.home_score
     and new.away_score is not distinct from old.away_score then
    return new;
  end if;

  select utc_kickoff, status into m
  from public.matches
  where id = new.match_id;

  if not found then
    raise exception 'Partido inexistente';
  end if;

  if m.status <> 'SCHEDULED'
     or now() >= (m.utc_kickoff - make_interval(mins => lock_minutes)) then
    raise exception 'Pronostico cerrado: el partido ya arranco o esta por arrancar'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_prediction_lock on public.predictions;
create trigger trg_enforce_prediction_lock
  before insert or update on public.predictions
  for each row
  execute function public.enforce_prediction_lock();
