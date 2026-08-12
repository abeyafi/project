-- ================================================================
-- FASE 2: Role Admin, Draft/Publish, Activity Log, Berita/Artikel
-- Aman dijalankan BERKALI-KALI di Supabase SQL Editor (idempotent) —
-- hanya menambah kolom/tabel baru, tidak menghapus data lama.
-- ================================================================

-- ---------- A. Role pada tabel admins ----------

-- Tambah kolom role HANYA kalau belum ada, dan HANYA saat itu promosikan
-- semua admin existing jadi super_admin (supaya tidak ada yang kehilangan
-- akses). Kalau script ini dijalankan ulang di kemudian hari, baris ini
-- tidak akan menimpa lagi admin yang sudah sengaja diturunkan rolenya.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'admins' and column_name = 'role'
  ) then
    alter table admins add column role text not null default 'admin';
    update admins set role = 'super_admin';
  end if;
end $$;

-- Constraint dibuat hanya kalau belum ada (ALTER TABLE ADD CONSTRAINT
-- tidak punya IF NOT EXISTS bawaan, jadi dibungkus manual).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admins_role_check'
  ) then
    alter table admins add constraint admins_role_check
      check (role in ('super_admin', 'admin'));
  end if;
end $$;

-- Untuk menurunkan admin tertentu jadi role biasa, jalankan manual:
--   update admins set role = 'admin' where email = 'contoh@rispi.id';

create or replace function is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where id = auth.uid() and role = 'super_admin'
  );
$$;

drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select
  using (is_admin());

drop policy if exists "super_admin manage admins" on admins;
create policy "super_admin manage admins" on admins for all
  using (is_super_admin())
  with check (is_super_admin());

-- ---------- B. Draft / Publish untuk Publikasi ----------
alter table publikasi add column if not exists status text not null default 'published';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'publikasi_status_check'
  ) then
    alter table publikasi add constraint publikasi_status_check
      check (status in ('draft', 'published', 'archived'));
  end if;
end $$;

alter table publikasi add column if not exists published_at timestamptz default now();
alter table publikasi add column if not exists created_at timestamptz default now();
alter table publikasi add column if not exists updated_at timestamptz default now();

-- Data lama otomatis 'published' lewat default di atas — tidak ada yang hilang.

drop policy if exists "public read publikasi" on publikasi;
create policy "public read publikasi" on publikasi for select
  using (status = 'published' or is_admin());

-- ---------- C. Tabel Berita / Artikel ----------
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  thumbnail_url text,
  author_id uuid references admins(id),
  category text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table articles enable row level security;

drop policy if exists "public read articles" on articles;
create policy "public read articles" on articles for select
  using (status = 'published' or is_admin());

drop policy if exists "admin write articles" on articles;
create policy "admin write articles" on articles for all
  using (is_admin())
  with check (is_admin());

-- ---------- D. Activity Log ----------
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references admins(id),
  actor_email text,
  action text not null,        -- create | update | delete | publish | unpublish | archive | login | upload | crop | role_change
  entity_type text not null,   -- publikasi | galeri | prestasi | articles | bidang | anggota | kalender | admins | dst
  entity_id text,
  description text,
  created_at timestamptz default now()
);

alter table activity_logs enable row level security;

drop policy if exists "admin insert activity_logs" on activity_logs;
create policy "admin insert activity_logs" on activity_logs for insert
  with check (is_admin());

drop policy if exists "admin read activity_logs" on activity_logs;
create policy "admin read activity_logs" on activity_logs for select
  using (is_admin());
-- Sengaja TIDAK ada policy update/delete — log tidak boleh diubah siapa pun lewat API.
