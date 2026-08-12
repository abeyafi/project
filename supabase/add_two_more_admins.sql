-- Daftarkan dua akun ini sebagai Admin (bukan Super Admin).
-- Pastikan kedua akun sudah dibuat lebih dulu lewat
-- Authentication > Add User (dengan Auto Confirm User dicentang):
--   1. ukkrispi@ar-raniry.ac.id / UKK123
--   2. belqis2029@gmail.com / 12345678910

insert into admins (id, email, name, role, is_active)
select id, email, split_part(email, '@', 1), 'admin', true
from auth.users
where email = 'ukkrispi@ar-raniry.ac.id'
on conflict (id) do update
  set is_active = true, updated_at = now();

insert into admins (id, email, name, role, is_active)
select id, email, split_part(email, '@', 1), 'admin', true
from auth.users
where email = 'belqis2029@gmail.com'
on conflict (id) do update
  set is_active = true, updated_at = now();

-- Cek hasilnya:
select email, role, is_active from admins
where email in ('ukkrispi@ar-raniry.ac.id', 'belqis2029@gmail.com');
