-- ================================================================
-- Tambahan: tabel Kalender Kegiatan (jalankan sekali di SQL Editor)
-- ================================================================

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null unique,
  title text,
  time_label text,
  location text,
  description text,
  updated_at timestamptz default now()
);

alter table calendar_events enable row level security;

create policy "public read calendar_events" on calendar_events for select
  using (true);

create policy "admin write calendar_events" on calendar_events for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
