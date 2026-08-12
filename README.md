# UKK RISPI — Website (dengan sistem Admin/Penonton)

Website organisasi UKK RISPI, UIN Ar-Raniry Banda Aceh. Dibangun dengan
Next.js (App Router) + Supabase (database, storage foto, dan login admin).

## Cara kerja Admin vs Penonton

- **Penonton** (siapa saja yang buka websitenya) hanya bisa melihat isi
  website — tidak ada tombol edit yang muncul sama sekali.
- **Admin** (yang sudah login lewat halaman `/login` dengan akun yang
  terdaftar di tabel `admins`) akan melihat tombol **Edit** di setiap
  bagian: klik teks untuk mengeditnya langsung, arahkan kursor ke foto
  untuk menggantinya, dan ada tombol "+ Tambah" untuk menambah entri baru
  (foto galeri, prestasi, publikasi, anggota bidang, dst).
- Setiap perubahan langsung tersimpan ke database Supabase — tidak perlu
  `git push` lagi untuk update konten sehari-hari (beda dengan versi
  sebelumnya yang datanya di-hardcode di kode).

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Setup Supabase (backend)

> **Project baru / mulai dari nol?** Cukup jalankan **satu file**:
> `supabase/00_full_schema.sql`. File ini sudah menggabungkan semua
> tabel, RLS, sistem role/admin, bucket Storage, dan seed data struktur
> organisasi RISPI — tidak perlu file lain. File-file SQL lama ada di
> `supabase/archive/` cuma untuk riwayat, tidak perlu dijalankan lagi.

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor → New Query**, paste seluruh isi
   `supabase/00_full_schema.sql`, klik **Run**. Ini otomatis membuat
   semua tabel, RLS, fungsi role, dan bucket Storage `media` (sudah
   public, tidak perlu diatur manual lagi).
3. Buka **Authentication → Users → Add User**, buat akun untuk dirimu
   sendiri (email + password, centang **Auto Confirm User**).
4. Jadikan akun itu Super Admin pertama lewat SQL Editor:
   ```sql
   insert into admins (id, email, name, role, is_active)
   select id, email, split_part(email,'@',1), 'super_admin', true
   from auth.users
   where email = 'email-kamu@contoh.com';
   ```
   Admin/Super Admin berikutnya bisa ditambah langsung lewat halaman
   `/admin/admins` di website (tidak perlu SQL lagi), asal orangnya
   sudah punya akun (langkah 3) lebih dulu.
5. Buka **Project Settings → API**, salin **Project URL** dan
   **anon public key**, masukkan ke `.env.local` (lihat bagian di
   bawah).

## Environment variables

File `.env.local` (sudah ada, isi kredensial Supabase kamu) **tidak
ikut ter-push ke GitHub** (memang sengaja, supaya kredensial tidak
publik di repo). Karena itu, kredensial yang sama harus didaftarkan
manual di Vercel:

1. Buka project di Vercel → **Settings → Environment Variables**.
2. Tambahkan dua variabel ini (untuk Production, Preview, dan
   Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy.

Tanpa langkah ini, website akan tampil tapi kosong (gagal konek ke
database) setelah di-deploy ke Vercel.

## Struktur project

```
app/
  layout.js         -> root layout, bungkus AdminProvider + AdminBar
  page.js            -> merangkai semua section
  login/page.js       -> halaman login admin
  globals.css        -> semua styling
components/
  Header, Hero, VisiMisi, Tentang, Divisi, Kalender, Bso,
  Prestasi, Galeri, Publikasi, Kontak, Footer  -> satu file per section
  EditableText.js    -> teks yang bisa diklik untuk diedit (admin only)
  EditablePhoto.js   -> slot foto yang bisa diganti (admin only, upload ke Supabase Storage)
  AdminBar.js        -> bar status login di atas halaman
hooks/
  useAdmin.js        -> context React: session login + status admin
lib/
  supabaseClient.js  -> koneksi ke Supabase
data/
  events.js          -> data Kalender Kegiatan (masih statis, lihat catatan di bawah)
supabase/
  schema.sql         -> SQL setup database + storage + RLS
public/
  logo-uin.png, logo-rispi.png
```

## Catatan: menambah acara di tanggal kosong

Kalau kamu login sebagai admin dan klik tanggal yang belum ada acaranya,
akan muncul tombol "+ Tambah acara di tanggal ini" di panel detail
sebelah kanan kalender. Tanggal kosong yang bisa diklik admin ditandai
dengan warna highlight halus saat kursor diarahkan ke situ (penonton
biasa tidak bisa mengklik tanggal kosong).

## Deploy ke Vercel lewat GitHub

```bash
git add .
git commit -m "Tambah sistem admin/penonton dengan Supabase"
git push
```

Vercel otomatis build ulang. Pastikan environment variables di atas
sudah didaftarkan sebelum push, supaya deployment pertama langsung
berhasil konek ke database.

## Fase 2 — Admin Dashboard, Role, Draft/Publish, Activity Log, Berita

Selain sistem admin/penonton dasar, sekarang tersedia:

- **`/admin`** — dashboard ringkasan (jumlah konten, draft vs published,
  aktivitas terbaru, quick actions). Hanya bisa diakses admin yang login
  — otomatis redirect ke `/login` kalau bukan admin.
- **Role**: `super_admin` dan `admin` di tabel `admins`. Semua admin yang
  sudah ada otomatis jadi `super_admin` setelah migrasi (lihat
  `supabase/phase2_admin_system.sql`), supaya tidak ada yang kehilangan
  akses. Hanya `super_admin` yang bisa mengelola baris admin lain.
- **Draft/Publish** untuk Publikasi dan Berita: status `draft` /
  `published` / `archived`. Draft hanya terlihat admin; penonton hanya
  lihat yang `published`. Ini ditegakkan di level database (RLS), bukan
  cuma disembunyikan di tampilan.
- **Activity Log** (`/admin/activity-log`): mencatat aksi admin (create,
  update, delete, publish, upload, dst) dengan filter. Log tidak bisa
  diedit/dihapus lewat API.
- **Berita/Artikel**: kelola di `/admin/berita`, publik lihat di
  `/berita` dan `/berita/[slug]`.
- **Crop foto sebelum upload**: semua slot foto (Galeri, foto
  Bidang/Divisi, foto Pengurus, thumbnail Berita) sekarang membuka modal
  crop (zoom, geser, putar) sebelum file benar-benar diupload ke
  Supabase Storage.

### Migrasi tambahan yang perlu dijalankan

Jalankan file `supabase/phase2_admin_system.sql` di SQL Editor Supabase
(aman, hanya menambah kolom/tabel — tidak menghapus data lama).

### Yang sengaja BELUM dibuat di fase ini

- CRUD Galeri/Prestasi/Divisi/Kalender **tetap** diedit langsung di
  halaman publik (inline editing yang sudah ada), bukan lewat form
  terpisah di `/admin` — sesuai instruksi untuk tidak membuat duplikasi
  fungsi yang sudah tersedia. Sidebar `/admin` punya pintasan langsung
  ke section-section itu di halaman utama.
- Draft/Publish untuk Galeri/Prestasi/Kalender belum diaktifkan (di
  brief disebut "jika relevan") — gampang ditambahkan nanti dengan pola
  yang sama seperti di Publikasi/Berita kalau memang dibutuhkan.
- UI untuk mengelola role admin lain (naik/turun jabatan, tambah admin
  baru dari dashboard) belum ada — untuk sekarang dikelola manual lewat
  SQL Editor Supabase (lebih aman untuk operasi sensitif ini).

## Fase 3 — Role-Based Access Control (RBAC) penuh

Sistem role sekarang lengkap: `super_admin` dan `admin`, dengan proteksi
di level database (bukan cuma disembunyikan di tampilan).

### Migrasi yang perlu dijalankan

`supabase/rbac_admin_management.sql` — tambah kolom `is_active`, ubah
`is_admin()`/`is_super_admin()` supaya ikut cek status aktif, proteksi
diri-sendiri & proteksi "minimal satu Super Admin aktif", dan fungsi
`add_admin_by_email()` untuk mengundang admin baru.

### Permission matrix

| Fitur | Super Admin | Admin |
|---|---|---|
| Dashboard, Publikasi, Galeri, Berita, Agenda, Prestasi, Organisasi | ✓ | ✓ |
| Activity Log | ✓ | ✓ |
| Kelola Admin (`/admin/admins`) | ✓ | ✗ (redirect ke `/unauthorized`) |
| Ubah role / nonaktifkan / hapus admin lain | ✓ | ✗ |
| Ubah role / status diri sendiri | ✗ (diblokir juga, oleh siapa pun) |

Proteksi ini ditegakkan di **tiga lapis**: tombol disembunyikan di UI,
RLS Supabase menolak query langsung dari admin biasa, dan trigger
database menolak percobaan ubah/hapus diri sendiri atau menyisakan nol
Super Admin aktif — bukan cuma mengandalkan frontend.

### Cara membuat Super Admin pertama / menambah admin baru

1. Orang itu harus punya akun dulu: Supabase → Authentication → Add
   User (isi email + password), atau biarkan mereka signup sendiri
   kalau situs sudah punya halaman signup publik (saat ini belum ada,
   jadi buat manual di dashboard).
2. Login sebagai Super Admin yang sudah ada → buka `/admin/admins` →
   klik **+ Tambah Admin** → masukkan email orang itu → pilih role →
   Simpan.
3. Kalau ini akun Super Admin PERTAMA di seluruh sistem (situs baru,
   belum ada admin sama sekali), daftarkan lewat SQL Editor:
   ```sql
   insert into admins (id, email, name, role, is_active)
   select id, email, split_part(email,'@',1), 'super_admin', true
   from auth.users where email = 'email-pertama@rispi.id';
   ```

### Halaman baru

- `/admin/admins` — kelola admin (Super Admin saja)
- `/unauthorized` — halaman akses ditolak, dipakai kalau admin biasa
  coba buka halaman yang bukan haknya

### Yang TIDAK dibangun (sesuai instruksi, di luar scope sekarang)

- Role `editor`, `admin_media`, `admin_riset` — struktur kolom `role`
  sudah siap diperluas (tinggal tambah nilai baru + update constraint),
  tapi UI/logic permission untuk role granular ini belum dibuat.
- Email invitation otomatis (Supabase Auth invite email) — saat ini
  admin baru harus dibuat manual dulu di dashboard Supabase sebelum
  bisa "diundang" di `/admin/admins`, karena membuat user Auth baru
  butuh service role key yang tidak aman dipakai di sisi browser.

## Lupa Password Admin

- Halaman `/login` sekarang punya tautan **"Lupa password?"** — admin
  masukkan email, dapat link reset lewat email.
- Link itu membawa mereka ke `/reset-password`, tempat mereka benar-benar
  mengetik password baru (bukan cuma auto-login tanpa bisa apa-apa).

### PENTING — supaya link reset tidak mengarah ke localhost

Di dashboard Supabase → **Authentication → URL Configuration**:
1. Ganti **Site URL** dari `http://localhost:3000` ke domain Vercel kamu
   (mis. `https://nama-project.vercel.app`).
2. Tambahkan domain itu juga ke **Redirect URLs** (boleh pakai wildcard,
   mis. `https://nama-project.vercel.app/**`).

Tanpa langkah ini, semua link dari email Supabase (reset password, dll)
akan selalu mengarah ke localhost, bukan ke situs live.

### Kalau Super Admin ingin reset password admin lain secara manual

Tidak perlu lewat email — buka Supabase → Authentication → Users → klik
user yang dimaksud → ada opsi untuk set password baru langsung dari
situ.

## Blokir Klik Kanan & Ctrl+U

`components/SecurityGuard.js` mem-blokir klik kanan (context menu) dan
Ctrl+U (lihat source) di seluruh halaman. **Catatan jujur:** ini cuma
penghalang ringan untuk pengunjung awam — bukan keamanan sesungguhnya.
Orang yang tahu masih bisa buka DevTools lewat menu browser (bukan
shortcut) atau cara lain. Data yang benar-benar sensitif tetap
dilindungi lewat Supabase RLS (Row Level Security) yang sudah berjalan
di seluruh tabel, bukan lewat trik di sisi browser ini.

Tidak ada migrasi SQL untuk fitur ini — murni perilaku di sisi browser.
