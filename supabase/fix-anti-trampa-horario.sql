-- =============================================================
-- FIX ANTI-TRAMPA: bloqueo de pronósticos por horario (server-side)
-- =============================================================
-- Pegá TODO este bloque en Supabase → SQL Editor → Run.
--
-- Qué resuelve: antes, un usuario podía cambiar la hora de su celular
-- para que la app le dejara cargar/editar pronósticos de partidos que
-- ya habían empezado o terminado (haciendo trampa con resultados
-- conocidos). Esto valida el horario en el SERVIDOR (now() de Postgres),
-- imposible de falsificar desde el celular.
--
-- Es seguro correrlo varias veces (usa create or replace / drop if exists).

create or replace function public.enforce_prediction_lock()
returns trigger
language plpgsql
as $$
declare
  m record;
  lock_minutes constant int := 5;
begin
  -- En UPDATE, si el pronóstico no cambia (ej: el scoring seteando
  -- points_awarded en partidos ya terminados), permitir sin chequear.
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

-- Verificación rápida (opcional): debería devolver 1 fila.
-- select tgname from pg_trigger where tgname = 'trg_enforce_prediction_lock';
