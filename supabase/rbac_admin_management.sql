-- ================================================================
-- RBAC PENUH: is_active, proteksi diri-sendiri, proteksi super_admin
-- terakhir, fungsi undang admin baru.
-- Aman dijalankan berkali-kali (idempotent). Tidak menghapus data.
-- ================================================================

-- ---------- A. Kolom tambahan ----------
alter table admins add column if not exists is_active boolean not null default true;
alter table admins add column if not exists updated_at timestamptz default now();

-- ---------- B. is_admin() / is_super_admin() sekarang cek is_active juga ----------
-- (Ini otomatis membuat admin yang dinonaktifkan langsung kehilangan akses
-- ke SEMUA fitur admin di seluruh situs, bukan cuma /admin/admins.)
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where id = auth.uid() and coalesce(is_active, true) = true
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
    select 1 from admins
    where id = auth.uid() and role = 'super_admin' and coalesce(is_active, true) = true
  );
$$;

-- ---------- C. Proteksi: tidak bisa ubah/hapus diri sendiri,
--              tidak bisa menyisakan nol super_admin aktif ----------
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

-- ---------- D. Undang admin baru lewat email ----------
-- Orang yang diundang harus SUDAH punya akun Supabase Auth (dibuat lewat
-- Authentication > Add User di dashboard, atau lewat signup sendiri).
-- Fungsi ini hanya mendaftarkan email tsb sebagai admin di tabel admins.
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
