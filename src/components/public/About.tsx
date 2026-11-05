import { ArrowUpRight, BadgeCheck, BookOpen, HandHeart, MapPin, Sparkles, Users } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Reveal } from "../Reveal";
import { isExternal, normalizeUrl } from "../../lib/utils";

const values = [
  {
    icon: BadgeCheck,
    title: "Evidence-based",
    text: "Keputusan terapi berpijak pada riset terbaru dan kondisi nyata pasien.",
  },
  {
    icon: HandHeart,
    title: "Empatik",
    text: "Mendengar dulu, memahami cerita, baru menyusun rencana bersama.",
  },
  {
    icon: Users,
    title: "Kolaboratif",
    text: "Bekerja sebagai bagian tim—pasien, keluarga, dan tenaga kesehatan.",
  },
  {
    icon: Sparkles,
    title: "Konsisten",
    text: "Progres kecil yang dirawat setiap hari lebih kuat dari lonjakan sesaat.",
  },
];

export function About() {
  const { content } = useSite();
  const { profile, settings } = content;
  if (!profile.full_name) return null;

  return (
    <section id="tentang" className="section">
      <div className="container-x">
        <div className="about-grid">
          <Reveal>
            <span className="section-label">01 — Tentang</span>
            <h2 className="h2 mt-5">
              {profile.tagline || "Menghubungkan ilmu gerak dengan pemulihan yang manusiawi."}
            </h2>

            <div className="surface mt-7 p-5 sm:p-6">
              <div className="fact-row">
                <span className="k">Peran</span>
                <span className="v">{profile.role || "Mahasiswa Fisioterapi"}</span>
              </div>
              <div className="fact-row">
                <span className="k">Pendidikan</span>
                <span className="v">{profile.university || "Program Studi Fisioterapi"}</span>
              </div>
              <div className="fact-row">
                <span className="k">Semester</span>
                <span className="v">{profile.semester || "—"}</span>
              </div>
              <div className="fact-row">
                <span className="k">Lokasi</span>
                <span className="v inline-flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--accent)]" />
                  {profile.location || "Indonesia"}
                </span>
              </div>

              {(profile.focus ?? []).length > 0 && (
                <div className="focus-list">
                  {profile.focus.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {profile.cv_url && (
                <a
                  href={normalizeUrl(profile.cv_url)}
                  target={isExternal(normalizeUrl(profile.cv_url)) ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="btn btn-ghost btn-sm mt-5"
                >
                  <BookOpen size={14} /> Lihat CV
                  <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </Reveal>

          <div>
            <Reveal delay={0.08}>
              <p className="lead">{profile.bio}</p>
              <p className="mt-5 text-[0.9rem] leading-[1.85] text-[var(--muted)]">{profile.long_bio}</p>
            </Reveal>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {values.map((value, index) => (
                <Reveal key={value.title} delay={0.1 + index * 0.05}>
                  <div className="surface-2 h-full p-4">
                    <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-2-soft)] text-[var(--accent-2)]">
                      <value.icon size={17} strokeWidth={1.7} />
                    </span>
                    <h3 className="text-[0.85rem] font-extrabold tracking-[-0.01em]">{value.title}</h3>
                    <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">{value.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-[0.72rem] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                  {settings.footer_note || "Terus belajar, terus bergerak."}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
