-- Tambah kolom email di tabel kontak (aman dijalankan berkali-kali,
-- tidak menghapus data yang sudah ada).
alter table kontak add column if not exists email text;

-- Isi nilai awal kalau masih kosong -- ganti sesuai email resmi
-- organisasi yang sebenarnya.
update kontak set email = 'ukkrispi@ar-raniry.ac.id'
where id = 1 and (email is null or email = '');
