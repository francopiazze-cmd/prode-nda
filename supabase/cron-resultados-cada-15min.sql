-- =============================================================
-- RESULTADOS CASI EN VIVO: la base de datos (Supabase) llama sola al
-- endpoint de scoring cada 15 minutos. Trae resultados, puntúa y deja
-- el ranking al día — sin GitHub, sin servicios externos, sin Vercel Pro.
-- =============================================================
--
-- ⚠️ ANTES DE CORRER: reemplazá  PEGA_ACA_TU_CRON_SECRET  por el valor real
-- de CRON_SECRET (está en Vercel → tu proyecto → Settings → Environment
-- Variables → CRON_SECRET). Es el MISMO que usa producción.
--
-- Pegá TODO este bloque en Supabase → SQL Editor → Run. Es seguro
-- correrlo varias veces (reprograma el mismo job, no duplica).

-- 1) Habilitar las extensiones necesarias (si no están)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Programar el job: cada 15 minutos, POST al endpoint de scoring
select cron.schedule(
  'actualizar-resultados',
  '*/15 * * * *',
  $$
    select net.http_post(
      url     := 'https://prode.ndasesores.com.ar/api/cron/score-matches',
      headers := jsonb_build_object(
        'Authorization', 'Bearer PEGA_ACA_TU_CRON_SECRET',
        'Content-Type',  'application/json'
      ),
      timeout_milliseconds := 60000
    );
  $$
);

-- ── Comandos útiles (opcionales, para después) ──
-- Ver el job programado:
--   select jobid, jobname, schedule, active from cron.job;
-- Ver las últimas corridas:
--   select jobname, status, return_message, start_time
--   from cron.job_run_details order by start_time desc limit 10;
-- Apagar el job (si alguna vez querés frenarlo):
--   select cron.unschedule('actualizar-resultados');


-- =============================================================
-- TEST INMEDIATO (opcional): dispará UNA llamada ahora y mirá la
-- respuesta, para confirmar que la base llega bien al endpoint.
-- Corré estas 2 consultas por separado, con unos segundos de diferencia.
-- =============================================================
-- (A) Disparar:
--   select net.http_post(
--     url     := 'https://prode.ndasesores.com.ar/api/cron/score-matches',
--     headers := jsonb_build_object('Authorization','Bearer PEGA_ACA_TU_CRON_SECRET','Content-Type','application/json'),
--     timeout_milliseconds := 60000
--   );
-- (B) Ver respuesta (status_code debe ser 200):
--   select id, status_code, content from net._http_response order by id desc limit 1;
