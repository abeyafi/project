export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <div className="brand-mark">
              <img src="/logo-rispi.png" alt="Logo RISPI" />
            </div>
            <div className="brand-text footer-brand-text">UKK RISPI</div>
          </div>
          <p className="footer-desc">
            Menggerakkan tradisi riset dan penalaran kritis mahasiswa UIN
            Ar-Raniry melalui karya tulis ilmiah, kompetisi, dan publikasi.
          </p>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Program</div>
          <a href="/#kalender">Kalender</a>
          <a href="/#bso">Seulawah</a>
          <a href="/#publikasi">Publikasi</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Sosial media</div>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">YouTube</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Navigasi</div>
          <a href="/">Beranda</a>
          <a href="/#tentang">Tentang</a>
          <a href="/#kontak">Kontak</a>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2026 UKK RISPI &mdash; UIN Ar-Raniry. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}
