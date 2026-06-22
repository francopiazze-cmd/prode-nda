-- =============================================================
-- RANKING EN VIVO: convertir el leaderboard de vista MATERIALIZADA
-- (una "foto" que hay que refrescar) a una vista NORMAL que se
-- calcula al momento. Así nunca más se queda desactualizado cuando
-- entra un referido, se valida un cliente o se registra alguien.
-- =============================================================
-- Pegá TODO este bloque en Supabase → SQL Editor → Run.
-- Es seguro correrlo varias veces.

-- 1) Sacar la vista materializada vieja (y su índice)
drop materialized view if exists public.leaderboard;

-- 2) Crear la vista normal con la MISMA lógica de puntos
create or replace view public.leaderboard as
with prediction_stats as (
  select
    p.user_id,
    coalesce(sum(p.points_awarded), 0) as base_points,
    count(*) filter (where p.points_awarded = 5) as exact_hits,
    count(*) filter (
      where p.points_awarded >= 1
      and (m.home_team_name = 'Argentina' or m.away_team_name = 'Argentina')
    ) as argentina_hits
  from public.predictions p
  join public.matches m on m.id = p.match_id
  where m.status = 'FINISHED'
  group by p.user_id
),
referral_bonus as (
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
  coalesce(ps.exact_hits, 0) as exact_hits,
  coalesce(ps.argentina_hits, 0) as argentina_hits,
  coalesce(rb.bonus_points, 0) as referral_points,
  coalesce(rb.referral_count, 0) as referral_count,
  case when pr.nda_client_verified then 20 else 0 end as nda_bonus_points
from public.profiles pr
left join prediction_stats ps on ps.user_id = pr.id
left join referral_bonus rb on rb.user_id = pr.id;

-- 3) Permisos de lectura (igual que la vista anterior)
grant select on public.leaderboard to anon, authenticated;

-- 4) refresh_leaderboard ya no hace falta (la vista es en vivo), pero
--    el código la sigue llamando. La dejamos como "no-op" para no romper nada.
create or replace function public.refresh_leaderboard()
returns void
language plpgsql
as $$
begin
  -- La vista ahora es normal y siempre está actualizada. Nada que refrescar.
  return;
end;
$$;
