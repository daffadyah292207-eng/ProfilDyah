import { ArrowUp } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Logo } from "../Logo";
import { SocialIcon } from "../Icons";
import { isExternal, normalizeUrl } from "../../lib/utils";

export function Footer() {
  const { content } = useSite();
  const { profile, settings } = content;
  const socials = content.socials.filter((item) => item.visible && item.url);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container-x">
        <div className="footer-top">
          <div>
            <div className="footer-mark">
              Mari <em>bergerak.</em>
            </div>
            <p className="footer-note mt-4">
              {settings.footer_note || "Dirancang dengan rasa ingin tahu dan sedikit peregangan."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((social) => {
                const url = normalizeUrl(social.url);
                return (
                  <a
                    key={social.id}
                    href={url}
                    target={isExternal(url) ? "_blank" : undefined}
                    rel={isExternal(url) ? "noreferrer noopener" : undefined}
                    className="chip transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <SocialIcon platform={social.platform} className="h-3 w-3" />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:gap-14">
            <div>
              <div className="mb-3 text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                Jelajahi
              </div>
              <div className="grid gap-1.5 text-[0.8rem] font-semibold">
                <a href="#tentang" className="hover:text-[var(--accent)]">Tentang</a>
                <a href="#keahlian" className="hover:text-[var(--accent)]">Keahlian</a>
                <a href="#pengalaman" className="hover:text-[var(--accent)]">Pengalaman</a>
                <a href="#proyek" className="hover:text-[var(--accent)]">Proyek</a>
                <a href="#kontak" className="hover:text-[var(--accent)]">Kontak</a>
              </div>
            </div>
            <div>
              <div className="mb-3 text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                Lainnya
              </div>
              <div className="grid gap-1.5 text-[0.8rem] font-semibold">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="hover:text-[var(--accent)]">
                    Email
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex w-fit items-center gap-1.5 text-left hover:text-[var(--accent)]"
                >
                  <ArrowUp size={12} /> Kembali ke atas
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="flex items-center gap-2">
            <Logo brand={settings.brand_name || "Dyah."} logoUrl={settings.logo_url} size="sm" />
          </div>
          <span>© {year} {profile.full_name || profile.nickname}. Dibuat dengan hati.</span>
          <span>Fisioterapi · Rehabilitasi · Gerak</span>
        </div>
      </div>
    </footer>
  );
}
