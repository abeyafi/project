-- ================================================================
-- Tambahan: statistik di Hero (50+ Anggota aktif, dst) jadi editable.
-- Aman dijalankan berkali-kali (idempotent).
-- ================================================================

create table if not exists hero_stats (
  id int primary key default 1,
  stat1_value text default '50+',
  stat1_label text default 'Anggota aktif',
  stat2_value text default '12',
  stat2_label text default 'Naskah terpublikasi',
  stat3_value text default '4',
  stat3_label text default 'Divisi riset',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into hero_stats (id)
  values (1)
  on conflict (id) do nothing;

alter table hero_stats enable row level security;

drop policy if exists "public read hero_stats" on hero_stats;
create policy "public read hero_stats" on hero_stats for select
  using (true);

drop policy if exists "admin write hero_stats" on hero_stats;
create policy "admin write hero_stats" on hero_stats for all
  using (is_admin())
  with check (is_admin());
