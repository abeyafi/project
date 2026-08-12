-- ================================================================
-- FIX: infinite recursion pada RLS policy admin.
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- Tidak menghapus data apa pun, hanya memperbaiki aturan keamanan.
-- ================================================================

-- 1) Fungsi is_admin() yang boleh mengecek tabel admins
--    tanpa kena aturan RLS tabel admins itu sendiri.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

-- 2) Ganti semua policy "admin write ..." supaya pakai is_admin()
--    (drop dulu yang lama, baru buat ulang).

drop policy if exists "admin write pimpinan_inti" on pimpinan_inti;
create policy "admin write pimpinan_inti" on pimpinan_inti for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write bidang" on bidang;
create policy "admin write bidang" on bidang for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write bidang_anggota" on bidang_anggota;
create policy "admin write bidang_anggota" on bidang_anggota for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write prestasi" on prestasi;
create policy "admin write prestasi" on prestasi for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write publikasi" on publikasi;
create policy "admin write publikasi" on publikasi for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write galeri" on galeri;
create policy "admin write galeri" on galeri for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write kontak" on kontak;
create policy "admin write kontak" on kontak for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write visi_misi" on visi_misi;
create policy "admin write visi_misi" on visi_misi for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write calendar_events" on calendar_events;
create policy "admin write calendar_events" on calendar_events for all
  using (is_admin()) with check (is_admin());

-- 3) Perbaiki policy SELECT pada tabel admins itu sendiri
--    (ini sumber utama recursion-nya).
drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select
  using (is_admin());

-- 4) Perbaiki policy storage (upload/update/delete foto).
drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert
  with check (bucket_id = 'media' and is_admin());

drop policy if exists "admin update media" on storage.objects;
create policy "admin update media" on storage.objects for update
  using (bucket_id = 'media' and is_admin());

drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete
  using (bucket_id = 'media' and is_admin());
