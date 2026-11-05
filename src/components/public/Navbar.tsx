import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutDashboard, Menu, Moon, Sun, X } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Logo } from "../Logo";
import { cn } from "../../lib/utils";

const links = [
  { href: "#tentang", label: "Tentang", id: "tentang" },
  { href: "#keahlian", label: "Keahlian", id: "keahlian" },
  { href: "#pengalaman", label: "Pengalaman", id: "pengalaman" },
  { href: "#proyek", label: "Proyek", id: "proyek" },
  { href: "#kontak", label: "Kontak", id: "kontak" },
];

export function Navbar() {
  const { content, mode, toggleMode } = useSite();
  const { settings, profile } = content;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const position = window.scrollY + 140;
      let current = "";
      for (const link of links) {
        const element = document.getElementById(link.id);
        if (element && element.offsetTop <= position) current = link.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={cn("site-header", scrolled && "is-scrolled")}>
        <div className="container-x nav-inner">
          <Logo brand={settings.brand_name || profile.nickname || "Dyah."} logoUrl={settings.logo_url} />

          <nav className="nav-links" aria-label="Navigasi utama">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={cn("nav-link", active === link.id && "is-active")}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              onClick={toggleMode}
              className="icon-btn"
              aria-label={mode === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              title={mode === "dark" ? "Mode terang" : "Mode gelap"}
            >
              {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to="/admin"
              className="icon-btn desktop-only"
              title="Dashboard admin"
              aria-label="Buka dashboard admin"
            >
              <LayoutDashboard size={16} />
            </Link>
            <a href="#kontak" className="btn btn-primary btn-sm desktop-only">
              {settings.cta_secondary || "Mari terhubung"}
              <ArrowUpRight size={14} />
            </a>
            <button
              type="button"
              className="icon-btn mobile-only"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-menu">
          {links.map((link) => (
            <a key={link.id} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <LayoutDashboard size={15} /> Dashboard admin
          </Link>
          <a
            href="#kontak"
            onClick={() => setOpen(false)}
            className="btn btn-accent mt-3 w-full"
          >
            {settings.cta_secondary || "Mari terhubung"}
            <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </>
  );
}
