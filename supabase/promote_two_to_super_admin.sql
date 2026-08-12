-- Jadikan kedua akun ini Super Admin.
-- Kalau baris admins-nya belum ada sama sekali, jalankan dulu
-- add_two_more_admins.sql, baru jalankan ini.

update admins
set role = 'super_admin', is_active = true, updated_at = now()
where email = 'ukkrispi@ar-raniry.ac.id';

update admins
set role = 'super_admin', is_active = true, updated_at = now()
where email = 'belqis2029@gmail.com';

-- Cek hasilnya:
select email, role, is_active from admins
where email in ('ukkrispi@ar-raniry.ac.id', 'belqis2029@gmail.com');
