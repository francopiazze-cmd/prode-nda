-- =============================================================
-- RENDIMIENTO PÚBLICO EN EL RANKING
-- Agrega a la vista del leaderboard el desglose de cada usuario
-- (exactos / diferencia / ganador / errados) para mostrarlo en el
-- popup al tocar un nombre. Solo expone números agregados — NO los
-- pronósticos individuales de nadie.
-- =============================================================
-- Pegá TODO en Supabase → SQL Editor → Run. Es seguro re-correrlo.

create or replace view public.leaderboard as
with prediction_stats as (
  select
    p.user_id,
    coalesce(sum(p.points_awarded), 0) as base_points,
    count(*) filter (where p.points_awarded = 5) as exact_hits,
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
