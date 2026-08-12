-- ================================================================
-- Perbaiki data Publikasi jadi data asli (bukan placeholder karangan).
-- Semua ditandai status='draft' karena naskah-naskah ini masih dalam
-- proses/belum terbit -- JANGAN diklaim sudah terindeks SINTA/Scopus
-- sampai benar-benar terbit. Ganti ke 'published' + isi badge index
-- yang benar nanti kalau sudah resmi terbit.
--
-- Aman dijalankan berkali-kali: hanya mengisi kalau tabel publikasi
-- masih kosong, supaya tidak menduplikasi/menimpa entri yang sudah
-- kamu tambah/edit manual di website.
-- ================================================================

insert into publikasi (title, meta, badge, status, sort_order)
select * from (values
  (
    'Biblioterapi Naratif dan Resiliensi Psikologis',
    'Analisis karakter Han Sooyoung & Kim Dokja (Omniscient Reader''s Viewpoint)',
    'Dalam Proses',
    'draft',
    0
  ),
  (
    'Persepsi Publik mengenai Dampak Pengurangan Anggaran Pendidikan terhadap Kesejahteraan Psikologis Siswa: Analisis Sentimen Komentar YouTube Berbasis Machine Learning',
    'Kolaborasi penelitian',
    'Dalam Proses',
    'draft',
    1
  ),
  (
    'Universal Design for Learning: Solusi Sistemik Stigma Neurodivergensi dalam Pendidikan Indonesia',
    'Kolaborasi dengan rekan dan dosen pembimbing',
    'Dalam Proses',
    'draft',
    2
  ),
  (
    'Determinan Psikologis Perilaku Pro-Lingkungan Mahasiswa (Studi Mikroplastik)',
    'Bersama Raihana Jinan Ullya, Xyty Malycha Vandana Kesuma, Aulia Rohendi',
    'Siap Submit',
    'draft',
    3
  )
) as v(title, meta, badge, status, sort_order)
where not exists (select 1 from publikasi);
