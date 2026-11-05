import { ArrowDown, ArrowUpRight, GraduationCap, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useSite } from "../../context/SiteContext";
import { PortraitArt } from "../Portrait";
import { SocialIcon } from "../Icons";
import { isExternal, normalizeUrl } from "../../lib/utils";

export function Hero() {
  const { content } = useSite();
  const { profile, settings } = content;
  const socials = content.socials.filter((item) => item.visible && item.url).slice(0, 5);
  const stats = (profile.stats ?? []).slice(0, 3);
  const reduce = useReducedMotion();

  return (
    <section id="beranda" className="hero">
      <div className="container-x">
        <div className="hero-grid">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <span className="eyebrow">
                <span className="dot" />
                {settings.hero_eyebrow || "Fisioterapi • Rehabilitasi • Wellness"}
              </span>
              {profile.availability && (
                <span className="chip border-[var(--accent)]/20 bg-[var(--accent-soft)] text-[var(--accent)]">
                  {profile.availability}
                </span>
              )}
            </motion.div>

            <motion.h1
              className="hero-title display"
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="line">{settings.hero_title_1}</span>
              <span className="line">
                <em>{settings.hero_title_accent}</em> {settings.hero_title_2}
              </span>
            </motion.h1>

            <motion.p
              className="hero-desc"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {settings.hero_description}
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="#tentang" className="btn btn-primary">
                {settings.cta_primary || "Kenali saya"}
                <ArrowDown size={15} />
              </a>
              <a href="#kontak" className="btn btn-ghost">
                {settings.cta_secondary || "Mari terhubung"}
                <ArrowUpRight size={15} />
              </a>
            </motion.div>

            <motion.div
              className="hero-socials"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.38 }}
            >
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Terhubung
              </span>
              <div className="social-rail">
                {socials.map((social) => {
                  const url = normalizeUrl(social.url);
                  return (
                    <a
                      key={social.id}
                      href={url}
                      className="social-pill"
                      aria-label={social.label}
                      title={social.label}
                      target={isExternal(url) ? "_blank" : undefined}
                      rel={isExternal(url) ? "noreferrer noopener" : undefined}
                    >
                      <SocialIcon platform={social.platform} className="h-[15px] w-[15px]" />
                    </a>
                  );
                })}
              </div>
              <span className="hidden h-px w-8 bg-[var(--line-strong)] sm:block" />
              <span className="flex items-center gap-1.5 text-[0.68rem] text-[var(--muted)]">
                <MapPin size={12} />
                {profile.location || "Indonesia"}
              </span>
            </motion.div>
          </div>

          <motion.div
            className="portrait-wrap"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portrait-ring" aria-hidden="true" />
            <div className="portrait-frame">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Foto ${profile.full_name || profile.nickname}`}
                  className="portrait-img"
                />
              ) : (
                <PortraitArt />
              )}
            </div>

            {profile.availability && (
              <div className="float-card left-[-0.75rem] top-[16%] sm:left-[-1.5rem]">
                <span className="fc-icon">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                <div>
                  <div className="fc-label">Status</div>
                  <div className="fc-value">Open to collaborate</div>
                </div>
              </div>
            )}

            <div className="float-card right-[-0.5rem] top-[55%] sm:right-[-1.5rem]">
              <span className="fc-icon">
                <GraduationCap size={17} />
              </span>
              <div>
                <div className="fc-label">{profile.semester || "Pendidikan"}</div>
                <div className="fc-value max-w-[8.5rem] leading-tight">
                  {profile.university || profile.role}
                </div>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="hero-stats">
                {stats.map((stat) => (
                  <div className="hero-stat" key={`${stat.label}-${stat.value}`}>
                    <div className="v">{stat.value}</div>
                    <div className="l">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <span className="hero-scroll" aria-hidden="true">
        Gulir untuk menjelajah
      </span>
    </section>
  );
}
