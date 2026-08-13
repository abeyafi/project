-- ================================================================
-- PROGRAM KERJA — menghubungkan tombol "Lihat Program" yang sudah
-- ada di kartu Bidang ke database sungguhan (sebelumnya tombol itu
-- ada tapi tidak mengarah ke mana pun / href="#").
-- Aman dijalankan berkali-kali. Tidak menghapus data existing.
-- Database boleh (memang sengaja) kosong -- TIDAK ada data dummy
-- yang di-insert di sini, isi manual lewat /admin/program setelah
-- rapat kerja resmi.
-- ================================================================

-- ---------- A. Tambah slug ke tabel bidang (untuk URL /program/[slug]) ----------
alter table bidang add column if not exists slug text;

update bidang set slug = 'riset'
  where slug is null and title ilike '%Penelitian%';
update bidang set slug = 'psdm'
  where slug is null and title ilike '%Sumber Daya%';
update bidang set slug = 'humas-media'
  where slug is null and title ilike '%Humas%';
-- fallback generik untuk bidang lain yang mungkin ditambah nanti
update bidang set slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
  where slug is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bidang_slug_unique') then
    alter table bidang add constraint bidang_slug_unique unique (slug);
  end if;
end $$;

-- ---------- B. Tabel programs ----------
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references bidang(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  objective text,
  person_in_charge text,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (division_id, slug)
);

alter table programs enable row level security;

drop policy if exists "public read programs" on programs;
create policy "public read programs" on programs for select
  using (status = 'published' or is_admin());

drop policy if exists "admin write programs" on programs;
create policy "admin write programs" on programs for all
  using (is_admin())
  with check (is_admin());
