-- ================================================================
-- UKK RISPI website — schema untuk sistem admin/penonton
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- ================================================================

create extension if not exists "pgcrypto";

-- ---------- Tabel admins (allowlist) ----------
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- ---------- Pimpinan Inti ----------
create table if not exists pimpinan_inti (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  photo_url text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ---------- Bidang ----------
create table if not exists bidang (
  id uuid primary key default gen_random_uuid(),
  index_no text,
  title text not null,
  description text,
  ketua text,
  photo_url text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

create table if not exists bidang_anggota (
  id uuid primary key default gen_random_uuid(),
  bidang_id uuid references bidang(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

-- ---------- Prestasi ----------
create table if not exists prestasi (
  id uuid primary key default gen_random_uuid(),
  year text,
  rank text,
  rank_class text,          -- 'gold' | 'silver' | 'outline'
  title text,
  competition text,
  level text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ---------- Publikasi ----------
create table if not exists publikasi (
  id uuid primary key default gen_random_uuid(),
  title text,
  meta text,
  badge text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ---------- Galeri ----------
create table if not exists galeri (
  id uuid primary key default gen_random_uuid(),
  title text,
  date_label text,
  photo_url text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ---------- Kontak (baris tunggal) ----------
create table if not exists kontak (
  id int primary key default 1,
  alamat text,
  kerja_sama text,
  instagram text,
  form_url text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into kontak (id, alamat, kerja_sama, instagram, form_url)
  values (1, 'Gedung FTK, Kampus UIN Ar-Raniry, Banda Aceh, Indonesia', '+62 8xx-xxxx-xxxx', '@rispi.arraniry', '')
  on conflict (id) do nothing;

-- ---------- Visi & Misi (baris tunggal) ----------
create table if not exists visi_misi (
  id int primary key default 1,
  visi text,
  misi text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into visi_misi (id, visi, misi)
  values (1, '', '')
  on conflict (id) do nothing;

-- ================================================================
-- Row Level Security: semua orang boleh baca, hanya admin boleh tulis
-- ================================================================

alter table pimpinan_inti enable row level security;
alter table bidang enable row level security;
alter table bidang_anggota enable row level security;
alter table prestasi enable row level security;
alter table publikasi enable row level security;
alter table galeri enable row level security;
alter table kontak enable row level security;
alter table visi_misi enable row level security;
alter table admins enable row level security;

-- Baca publik untuk semua tabel konten
create policy "public read pimpinan_inti" on pimpinan_inti for select using (true);
create policy "public read bidang" on bidang for select using (true);
create policy "public read bidang_anggota" on bidang_anggota for select using (true);
create policy "public read prestasi" on prestasi for select using (true);
create policy "public read publikasi" on publikasi for select using (true);
create policy "public read galeri" on galeri for select using (true);
create policy "public read kontak" on kontak for select using (true);
create policy "public read visi_misi" on visi_misi for select using (true);

-- Tulis (insert/update/delete) hanya untuk yang terdaftar di admins
create policy "admin write pimpinan_inti" on pimpinan_inti for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write bidang" on bidang for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write bidang_anggota" on bidang_anggota for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write prestasi" on prestasi for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write publikasi" on publikasi for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write galeri" on galeri for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write kontak" on kontak for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
create policy "admin write visi_misi" on visi_misi for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

-- Tabel admins: admin cuma boleh lihat daftar admin, tidak ada yang boleh insert dari client
create policy "admin read admins" on admins for select
  using (exists (select 1 from admins a where a.id = auth.uid()));

-- ================================================================
-- Storage policies untuk bucket "media" (buat bucket-nya dulu manual
-- lewat menu Storage sebelum menjalankan bagian ini)
-- ================================================================
create policy "public read media" on storage.objects for select
  using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert
  with check (bucket_id = 'media' and exists (select 1 from admins where id = auth.uid()));
create policy "admin update media" on storage.objects for update
  using (bucket_id = 'media' and exists (select 1 from admins where id = auth.uid()));
create policy "admin delete media" on storage.objects for delete
  using (bucket_id = 'media' and exists (select 1 from admins where id = auth.uid()));
