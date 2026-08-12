-- ================================================================
-- Isi ulang data Pimpinan Inti, Bidang, dan Anggota Bidang.
-- Aman dijalankan berkali-kali — hanya mengisi kalau tabelnya masih
-- kosong (tidak akan menduplikasi kalau kamu sudah pernah menambah
-- data sendiri lewat tombol "+ Tambah" di website).
-- ================================================================

-- ---------- Pimpinan Inti ----------
insert into pimpinan_inti (name, role, sort_order)
select * from (values
  ('Riziq Elfathir', 'Ketua Umum', 0),
  ('Nahzafusy Syima', 'Sekretaris Umum', 1),
  ('Cut Meutia', 'Bendahara Umum', 2)
) as v(name, role, sort_order)
where not exists (select 1 from pimpinan_inti);

-- ---------- Bidang ----------
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

-- ---------- Anggota per Bidang ----------
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
