-- Jadikan dua akun ini Super Admin.
-- Pastikan kedua akun sudah dibuat lewat Authentication > Add User
-- (dengan Auto Confirm User dicentang) sebelum menjalankan ini.

insert into admins (id, email, name, role, is_active)
select id, email, split_part(email, '@', 1), 'super_admin', true
from auth.users
where email = 'syahranidhea5@gmail.com'
on conflict (id) do update
  set role = 'super_admin', is_active = true, updated_at = now();

insert into admins (id, email, name, role, is_active)
select id, email, split_part(email, '@', 1), 'super_admin', true
from auth.users
where email = 'riziqelfathir@gmail.com'
on conflict (id) do update
  set role = 'super_admin', is_active = true, updated_at = now();

-- Cek hasilnya:
select email, role, is_active from admins
where email in ('syahranidhea5@gmail.com', 'riziqelfathir@gmail.com');
