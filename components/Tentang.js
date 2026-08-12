const PILLS = [
  "Bimbingan Riset",
  "Publikasi Ilmiah",
  "Kompetisi Akademik",
  "Jejaring Peneliti",
];

const FEATURES = [
  {
    index: "01",
    title: "Pendampingan Riset",
    desc: "Bimbingan langsung dari tahap ideasi, metodologi, hingga analisis data bersama mentor berpengalaman.",
  },
  {
    index: "02",
    title: "Publikasi Terindeks",
    desc: "Pendampingan penulisan hingga naskah siap disubmit ke jurnal SINTA dan Scopus.",
  },
  {
    index: "03",
    title: "Persiapan Kompetisi",
    desc: "Pelatihan intensif menghadapi PKM, LKTI, dan kompetisi karya tulis tingkat nasional.",
  },
];

export default function Tentang() {
  return (
    <section className="tentang" id="tentang">
      <div className="tentang-inner">
        <div className="tentang-head">
          <span className="section-eyebrow on-navy">Bagaimana Kami Membantu</span>
          <h2 className="section-title reveal">
            Ruang tumbuh bagi peneliti muda UIN Ar-Raniry
          </h2>
          <p className="section-sub reveal reveal-delay-1">
            Dari diskusi kajian mingguan hingga naskah siap submit, RISPI
            mendampingi setiap tahap perjalanan ilmiahmu.
          </p>
          <div className="pill-row reveal reveal-delay-2">
            {PILLS.map((pill) => (
              <div className="pill" key={pill}>
                <span className="dot"></span>
                {pill}
              </div>
            ))}
          </div>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div className={`feature-card reveal${i ? ` reveal-delay-${i}` : ""}`} key={f.index}>
              <div className="feature-index">{f.index}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
