import { BriefcaseBusiness, GraduationCap, Users } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Reveal } from "../Reveal";
import type { ExperienceKind } from "../../types";

const kindIcon: Record<ExperienceKind, typeof GraduationCap> = {
  Pendidikan: GraduationCap,
  Pengalaman: BriefcaseBusiness,
  Organisasi: Users,
};

export function Timeline() {
  const { content } = useSite();
  const experiences = content.experiences.filter((item) => item.visible);
  if (experiences.length === 0) return null;

  return (
    <section id="pengalaman" className="section">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="section-label">03 — Perjalanan</span>
              <h2 className="h2 mt-5">
                Belajar di kelas, <em className="serif-italic">bertumbuh</em> di lapangan.
              </h2>
              <p className="mt-4 max-w-md text-[0.88rem] leading-relaxed text-[var(--muted)]">
                Setiap pengalaman—dari laboratorium sampai posyandu—mengajarkan bahwa teori terbaik
                adalah yang bisa menyentuh kehidupan sehari-hari.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {(["Pendidikan", "Pengalaman", "Organisasi"] as ExperienceKind[]).map((kind) => {
                  const Icon = kindIcon[kind];
                  const count = experiences.filter((item) => item.kind === kind).length;
                  if (!count) return null;
                  return (
                    <span className="chip" key={kind}>
                      <Icon size={12} className="text-[var(--accent)]" />
                      {kind} · {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <div className="timeline">
            {experiences.map((item, index) => {
              const Icon = kindIcon[item.kind] ?? BriefcaseBusiness;
              return (
                <Reveal key={item.id} delay={index * 0.05} y={16}>
                  <article className="timeline-item">
                    <span className="timeline-dot" />
                    <div className="timeline-card">
                      <div className="timeline-head">
                        <div>
                          <div className="mb-1 flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">
                            <Icon size={11} />
                            {item.kind}
                          </div>
                          <h3 className="h3 text-[1.12rem]">{item.title}</h3>
                          <div className="timeline-org">
                            {item.organization}
                            {item.location ? ` · ${item.location}` : ""}
                          </div>
                        </div>
                        {item.period && <span className="timeline-period">{item.period}</span>}
                      </div>
                      <p className="timeline-desc">{item.description}</p>
                      {(item.highlights ?? []).length > 0 && (
                        <div className="timeline-highlights">
                          {item.highlights.map((highlight) => (
                            <span className="tag" key={highlight}>
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
