import ScrollReveal from "../components/ScrollReveal";
import Header from "../components/Header";
import Hero from "../components/Hero";
import VisiMisi from "../components/VisiMisi";
import Tentang from "../components/Tentang";
import Divisi from "../components/Divisi";
import Kalender from "../components/Kalender";
import Bso from "../components/Bso";
import Prestasi from "../components/Prestasi";
import Galeri from "../components/Galeri";
import Publikasi from "../components/Publikasi";
import Kontak from "../components/Kontak";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <Header />
      <Hero />
      <VisiMisi />
      <Tentang />
      <Divisi />
      <Kalender />
      <Bso />
      <Prestasi />
      <Galeri />
      <Publikasi />
      <Kontak />
      <Footer />
    </>
  );
}
