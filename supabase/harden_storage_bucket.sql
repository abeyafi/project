-- ================================================================
-- Batasi bucket "media" cuma boleh menerima file gambar, maks 8MB.
-- Ini ditegakkan di server (Supabase), tidak bisa dilewati walau
-- seseorang coba upload langsung lewat API tanpa lewat website.
-- Aman dijalankan berkali-kali.
-- ================================================================

update storage.buckets
set
  file_size_limit = 8388608, -- 8MB dalam bytes
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'media';
