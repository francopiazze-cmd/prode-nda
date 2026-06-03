-- =====================================================================
-- NDA Pole — schema de reservas. Correr una vez en el SQL Editor de Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Turnos de disponibilidad que carga la dueña.
create table if not exists availability_slots (
  id           uuid primary key default gen_random_uuid(),
  modality     text not null check (modality in ('presencial', 'virtual')),
  starts_at    timestamptz not null,
  duration_min int  not null default 60,
  capacity     int  not null default 1 check (capacity > 0),
  booked_count int  not null default 0,
  location     text,
  meeting_link text,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_slots_modality_start
  on availability_slots (modality, starts_at);

-- Reservas de las alumnas.
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  slot_id       uuid not null references availability_slots(id) on delete cascade,
  modality      text not null,
  starts_at     timestamptz not null,
  duration_min  int  not null,
  student_name  text not null,
  student_phone text not null,
  student_email text not null,
  status        text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_bookings_start on bookings (starts_at);

-- ---------------------------------------------------------------------
-- Reserva atómica: chequea cupo y suma booked_count en una sola tx.
-- Devuelve la fila de booking, o NULL si ya no hay lugar.
-- ---------------------------------------------------------------------
create or replace function book_slot(
  p_slot_id uuid,
  p_name    text,
  p_phone   text,
  p_email   text
) returns bookings
language plpgsql
as $$
declare
  v_slot    availability_slots;
  v_booking bookings;
begin
  -- Bloquea la fila del turno para evitar doble reserva en paralelo.
  select * into v_slot from availability_slots where id = p_slot_id for update;
  if not found then
    return null;
  end if;
  if v_slot.starts_at < now() then
    return null;
  end if;
  if v_slot.booked_count >= v_slot.capacity then
    return null;
  end if;

  insert into bookings (
    slot_id, modality, starts_at, duration_min,
    student_name, student_phone, student_email
  ) values (
    v_slot.id, v_slot.modality, v_slot.starts_at, v_slot.duration_min,
    p_name, p_phone, p_email
  ) returning * into v_booking;

  update availability_slots
    set booked_count = booked_count + 1
    where id = v_slot.id;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- Seguridad: todo el acceso pasa por el server con la service role key,
-- que ignora RLS. Activamos RLS sin políticas para bloquear cualquier
-- acceso directo con la anon key desde el navegador.
-- ---------------------------------------------------------------------
alter table availability_slots enable row level security;
alter table bookings enable row level security;
