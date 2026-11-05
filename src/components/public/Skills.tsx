import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Reveal } from "../Reveal";
import { SkillIcon } from "../Icons";
import { cn } from "../../lib/utils";

export function Skills() {
  const { content } = useSite();
  const skills = content.skills.filter((skill) => skill.visible);
  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(skills.map((skill) => skill.category).filter(Boolean)))],
    [skills],
  );
  const [filter, setFilter] = useState("Semua");

  if (skills.length === 0) return null;

  const filtered = filter === "Semua" ? skills : skills.filter((skill) => skill.category === filter);

  return (
    <section id="keahlian" className="section">
      <div className="container-x">
        <div className="skills-head">
          <Reveal className="max-w-[36rem]">
            <span className="section-label">02 — Keahlian</span>
            <h2 className="h2 mt-5">
              Ilmu yang dipelajari, <em className="serif-italic">keterampilan</em> yang dilatih.
            </h2>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-[var(--muted)]">
              Kombinasi pemahaman klinis, keterampilan tangan, dan komunikasi yang saya bangun
              melalui kelas, praktikum, dan pengalaman bersama masyarakat.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="skill-tabs" role="tablist" aria-label="Filter kategori keahlian">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  role="tab"
                  aria-selected={filter === category}
                  className={cn("skill-tab", filter === category && "is-active")}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="skills-grid">
          {filtered.map((skill, index) => (
            <Reveal key={skill.id} delay={index * 0.03} y={14}>
              <article className="skill-card h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="skill-top">
                    <span className="skill-icon">
                      <SkillIcon name={skill.icon} className="h-[17px] w-[17px]" />
                    </span>
                    <div>
                      <h3 className="skill-name">{skill.name}</h3>
                      <div className="skill-meta">{skill.category}</div>
                    </div>
                  </div>
                  <span className="text-[0.62rem] font-extrabold tabular-nums text-[var(--muted)]">
                    {skill.level}%
                  </span>
                </div>
                <p className="skill-desc">{skill.description}</p>
                <div className="skill-bar-row">
                  <div className="skill-bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }} />
                  </div>
                  <span className="skill-level">{skill.category}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="skill-footnote">
            <Info size={13} className="text-[var(--accent)]" />
            <span>
              {skills.length} keahlian terdaftar · {categories.length - 1} kategori · terus
              dikembangkan melalui praktik dan pembelajaran.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
