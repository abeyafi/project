-- ================================================================
-- UKK RISPI — SKEMA LENGKAP (versi bersih, untuk project Supabase baru)
-- Jalankan file ini SEKALI, dari atas sampai bawah, di SQL Editor.
-- Aman dijalankan ulang kalau perlu (idempotent).
-- ================================================================

create extension if not exists "pgcrypto";

-- ================================================================
-- 1. TABEL ADMINS + ROLE
-- ================================================================
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================================
-- 2. FUNGSI HELPER (dibuat lebih awal karena dipakai banyak policy)
-- ================================================================
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where id = auth.uid() and is_active = true
  );
$$;

create or replace function is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$;

-- Proteksi: tidak bisa ubah/hapus akun sendiri, tidak bisa menyisakan
-- nol Super Admin aktif.
create or replace function admins_protect_self_and_last_super()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_super_count int;
begin
  if tg_op = 'DELETE' then
    if old.id = auth.uid() then
      raise exception 'Tidak bisa menghapus akun sendiri.';
    end if;
    if old.role = 'super_admin' and old.is_active then
      select count(*) into active_super_count from admins
        where role = 'super_admin' and is_active = true and id <> old.id;
      if active_super_count = 0 then
        raise exception 'Minimal harus ada satu Super Admin aktif.';
      end if;
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.id = auth.uid()
       and (new.role is distinct from old.role or new.is_active is distinct from old.is_active) then
      raise exception 'Tidak bisa mengubah role atau status akun sendiri.';
    end if;
    if old.role = 'super_admin' and old.is_active
       and (new.role <> 'super_admin' or new.is_active = false) then
      select count(*) into active_super_count from admins
        where role = 'super_admin' and is_active = true and id <> old.id;
      if active_super_count = 0 then
        raise exception 'Minimal harus ada satu Super Admin aktif.';
      end if;
    end if;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_admins_protect on admins;
create trigger trg_admins_protect
  before update or delete on admins
  for each row execute function admins_protect_self_and_last_super();

-- Undang admin baru lewat email (orang itu harus sudah punya akun Auth).
create or replace function add_admin_by_email(p_email text, p_role text)
returns admins
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  result admins;
begin
  if not is_super_admin() then
    raise exception 'Hanya Super Admin yang boleh menambah admin.';
  end if;
  if p_role not in ('super_admin', 'admin') then
    raise exception 'Role tidak valid.';
  end if;

  select id into target_id from auth.users where email = p_email;
  if target_id is null then
    raise exception 'Belum ada akun dengan email ini. Buat dulu lewat Authentication > Add User di Supabase, baru undang lagi di sini.';
  end if;

  insert into admins (id, email, name, role, is_active)
  values (target_id, p_email, split_part(p_email, '@', 1), p_role, true)
  on conflict (id) do update
    set role = excluded.role, is_active = true, updated_at = now()
  returning * into result;

  return result;
end;
$$;

-- RLS tabel admins
alter table admins enable row level security;

drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select
  using (is_admin());

drop policy if exists "super_admin manage admins" on admins;
create policy "super_admin manage admins" on admins for all
  using (is_super_admin())
  with check (is_super_admin());

-- ================================================================
-- 3. STRUKTUR ORGANISASI: Pimpinan Inti, Bidang, Anggota Bidang
-- ================================================================
create table if not exists pimpinan_inti (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  photo_url text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

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

alter table pimpinan_inti enable row level security;
alter table bidang enable row level security;
alter table bidang_anggota enable row level security;

drop policy if exists "public read pimpinan_inti" on pimpinan_inti;
create policy "public read pimpinan_inti" on pimpinan_inti for select using (true);
drop policy if exists "admin write pimpinan_inti" on pimpinan_inti;
create policy "admin write pimpinan_inti" on pimpinan_inti for all
  using (is_admin()) with check (is_admin());

drop policy if exists "public read bidang" on bidang;
create policy "public read bidang" on bidang for select using (true);
drop policy if exists "admin write bidang" on bidang;
create policy "admin write bidang" on bidang for all
  using (is_admin()) with check (is_admin());

drop policy if exists "public read bidang_anggota" on bidang_anggota;
create policy "public read bidang_anggota" on bidang_anggota for select using (true);
drop policy if exists "admin write bidang_anggota" on bidang_anggota;
create policy "admin write bidang_anggota" on bidang_anggota for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 4. PRESTASI
-- ================================================================
create table if not exists prestasi (
  id uuid primary key default gen_random_uuid(),
  year text,
  rank text,
  rank_class text,
  title text,
  competition text,
  level text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

alter table prestasi enable row level security;
drop policy if exists "public read prestasi" on prestasi;
create policy "public read prestasi" on prestasi for select using (true);
drop policy if exists "admin write prestasi" on prestasi;
create policy "admin write prestasi" on prestasi for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 5. PUBLIKASI (dengan Draft/Publish)
-- ================================================================
create table if not exists publikasi (
  id uuid primary key default gen_random_uuid(),
  title text,
  meta text,
  badge text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz default now(),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table publikasi enable row level security;
drop policy if exists "public read publikasi" on publikasi;
create policy "public read publikasi" on publikasi for select
  using (status = 'published' or is_admin());
drop policy if exists "admin write publikasi" on publikasi;
create policy "admin write publikasi" on publikasi for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 6. GALERI
-- ================================================================
create table if not exists galeri (
  id uuid primary key default gen_random_uuid(),
  title text,
  date_label text,
  photo_url text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

alter table galeri enable row level security;
drop policy if exists "public read galeri" on galeri;
create policy "public read galeri" on galeri for select using (true);
drop policy if exists "admin write galeri" on galeri;
create policy "admin write galeri" on galeri for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 7. KONTAK (baris tunggal)
-- ================================================================
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
  values (1, 'Gedung FTK, Kampus UIN Ar-Raniry, Banda Aceh, Indonesia', '+62 8xx-xxxx-xxxx', '@ukkrispi', '')
  on conflict (id) do nothing;

alter table kontak enable row level security;
drop policy if exists "public read kontak" on kontak;
create policy "public read kontak" on kontak for select using (true);
drop policy if exists "admin write kontak" on kontak;
create policy "admin write kontak" on kontak for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 8. VISI & MISI (baris tunggal)
-- ================================================================
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

alter table visi_misi enable row level security;
drop policy if exists "public read visi_misi" on visi_misi;
create policy "public read visi_misi" on visi_misi for select using (true);
drop policy if exists "admin write visi_misi" on visi_misi;
create policy "admin write visi_misi" on visi_misi for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 9. KALENDER KEGIATAN
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
drop policy if exists "public read calendar_events" on calendar_events;
create policy "public read calendar_events" on calendar_events for select using (true);
drop policy if exists "admin write calendar_events" on calendar_events;
create policy "admin write calendar_events" on calendar_events for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 10. STATISTIK HERO (baris tunggal)
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
insert into hero_stats (id) values (1) on conflict (id) do nothing;

alter table hero_stats enable row level security;
drop policy if exists "public read hero_stats" on hero_stats;
create policy "public read hero_stats" on hero_stats for select using (true);
drop policy if exists "admin write hero_stats" on hero_stats;
create policy "admin write hero_stats" on hero_stats for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 11. KONTEN BSO / SEULAWAH (baris tunggal)
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
insert into bso_content (id) values (1) on conflict (id) do nothing;

alter table bso_content enable row level security;
drop policy if exists "public read bso_content" on bso_content;
create policy "public read bso_content" on bso_content for select using (true);
drop policy if exists "admin write bso_content" on bso_content;
create policy "admin write bso_content" on bso_content for all
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 12. BERITA / ARTIKEL (dengan Draft/Publish)
-- ================================================================
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
  using (is_admin()) with check (is_admin());

-- ================================================================
-- 13. ACTIVITY LOG
-- ================================================================
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references admins(id),
  actor_email text,
  action text not null,
  entity_type text not null,
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
-- Sengaja TIDAK ada policy update/delete — log tidak boleh diubah siapa pun.

-- ================================================================
-- 14. STORAGE — bucket "media" + kebijakan aksesnya
-- ================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'media', 'media', true,
    8388608, -- 8MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  on conflict (id) do update
    set file_size_limit = 8388608,
        allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert
  with check (bucket_id = 'media' and is_admin());

drop policy if exists "admin update media" on storage.objects;
create policy "admin update media" on storage.objects for update
  using (bucket_id = 'media' and is_admin());

drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete
  using (bucket_id = 'media' and is_admin());

-- ================================================================
-- 15. ISI DATA STRUKTUR ORGANISASI (data asli RISPI)
-- ================================================================
insert into pimpinan_inti (name, role, sort_order)
select * from (values
  ('Riziq Elfathir', 'Ketua Umum', 0),
  ('Nahzafusy Syima', 'Sekretaris Umum', 1),
  ('Cut Meutia', 'Bendahara Umum', 2)
) as v(name, role, sort_order)
where not exists (select 1 from pimpinan_inti);

insert into bidang (index_no, title, description, ketua, sort_order)
select * from (values
  ('01', 'Penelitian, Pengembangan, dan Publikasi Ilmiah',
   'Mendampingi riset, pengembangan program, dan publikasi karya ilmiah anggota.',
   'Nura Avadatis Sulha Hassan', 0),
  ('02', 'Pengembangan Sumber Daya Manusia',
   'Pembinaan, pelatihan, dan pengembangan kapasitas anggota RISPI.',
   'Muhammad Hani Syafiyyurrahman', 1),
  ('03', 'Hubungan Masyarakat dan Media',
   'Kerja sama eksternal, dokumentasi, dan pengelolaan media RISPI.',
   'Belqis Putri Fauzi', 2)
) as v(index_no, title, description, ketua, sort_order)
where not exists (select 1 from bidang);

insert into bidang_anggota (bidang_id, name, sort_order)
select b.id, v.name, v.sort_order
from (values
  ('Penelitian, Pengembangan, dan Publikasi Ilmiah', 'Abe Yafi Muqaddas', 0),
  ('Penelitian, Pengembangan, dan Publikasi Ilmiah', 'Teuku Ananta Aulia', 1),
  ('Penelitian, Pengembangan, dan Publikasi Ilmiah', 'Nadzli Dhea Syahrani', 2),
  ('Pengembangan Sumber Daya Manusia', 'Dimas Sagara', 0),
  ('Pengembangan Sumber Daya Manusia', 'Nabila Ramadhania', 1),
  ('Pengembangan Sumber Daya Manusia', 'Seri Minta', 2),
  ('Pengembangan Sumber Daya Manusia', 'Naila Nazira', 3),
  ('Hubungan Masyarakat dan Media', 'Nadhifah Azzuhra', 0),
  ('Hubungan Masyarakat dan Media', 'Nailatul Athiah', 1),
  ('Hubungan Masyarakat dan Media', 'Farah Munira', 2),
  ('Hubungan Masyarakat dan Media', 'Radhwa Taqiyya', 3),
  ('Hubungan Masyarakat dan Media', 'Zaitun Ramadhani', 4)
) as v(bidang_title, name, sort_order)
join bidang b on b.title = v.bidang_title
where not exists (select 1 from bidang_anggota);

-- ================================================================
-- SELESAI. Langkah terakhir (manual, tidak bisa lewat SQL):
-- 1. Authentication > Add User → buat akun Super Admin pertamamu
--    (centang "Auto Confirm User").
-- 2. Jalankan query ini (ganti email-nya):
--
--    insert into admins (id, email, name, role, is_active)
--    select id, email, split_part(email,'@',1), 'super_admin', true
--    from auth.users where email = 'email-kamu@contoh.com';
-- ================================================================
