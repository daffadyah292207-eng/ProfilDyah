import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useSite } from "../context/SiteContext";
import { Navbar } from "../components/public/Navbar";
import { Hero } from "../components/public/Hero";
import { Marquee } from "../components/public/Marquee";
import { About } from "../components/public/About";
import { Skills } from "../components/public/Skills";
import { Timeline } from "../components/public/Timeline";
import { Projects } from "../components/public/Projects";
import { Certifications } from "../components/public/Certifications";
import { Contact } from "../components/public/Contact";
import { Footer } from "../components/public/Footer";

export function Home() {
  const { content } = useSite();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  useEffect(() => {
    const name = content.profile.full_name || content.profile.nickname || "Dyah";
    document.title = `${name} — ${content.profile.role || "Mahasiswa Fisioterapi"}`;
    const description = content.profile.bio || "";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [content.profile.full_name, content.profile.nickname, content.profile.role, content.profile.bio]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-[var(--accent)]"
      />
      <a
        href="#tentang"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-[var(--bg)]"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Timeline />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
