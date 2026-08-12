-- ================================================================
-- Tambahan: konten BSO (Seulawah) jadi editable.
-- Aman dijalankan berkali-kali (idempotent).
-- ================================================================

create table if not exists bso_content (
  id int primary key default 1,
  eyebrow_active text default 'Seulawah — Kompetisi & Lomba',
  eyebrow_soon text default 'Segera hadir',
  tagline text default 'Pusat Persiapan Kompetisi & Lomba',
  title text default 'Seulawah',
  description text default 'Menyiapkan anggota RISPI menghadapi kompetisi karya tulis, debat ilmiah, dan olimpiade tingkat nasional — mulai dari pematangan gagasan, simulasi lomba, hingga pendampingan hari-H.',
  tags text[] default array['Karya Tulis Ilmiah','Debat & Business Case','Presentasi Ilmiah','Simulasi Lomba'],
  cta_label text default 'Lihat Program Seulawah',
  medal_caption text default 'Seulawah · Divisi Kompetisi',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into bso_content (id)
  values (1)
  on conflict (id) do nothing;

alter table bso_content enable row level security;

drop policy if exists "public read bso_content" on bso_content;
create policy "public read bso_content" on bso_content for select
  using (true);

drop policy if exists "admin write bso_content" on bso_content;
create policy "admin write bso_content" on bso_content for all
  using (is_admin())
  with check (is_admin());
