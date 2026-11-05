import { ArrowUpRight, FolderOpen } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Reveal } from "../Reveal";
import { isExternal, normalizeUrl } from "../../lib/utils";

const gradients = [
  "linear-gradient(135deg, #2F6B5A 0%, #16382F 100%)",
  "linear-gradient(135deg, #C85834 0%, #7E2F20 100%)",
  "linear-gradient(135deg, #4E6E81 0%, #22333D 100%)",
  "linear-gradient(135deg, #8A6A4A 0%, #3B2C1F 100%)",
];

export function Projects() {
  const { content } = useSite();
  const projects = content.projects.filter((item) => item.visible);
  if (projects.length === 0) return null;

  return (
    <section id="proyek" className="section">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <Reveal>
            <span className="section-label">04 — Proyek</span>
            <h2 className="h2 mt-5 max-w-[38rem]">
              Ide kecil yang <em className="serif-italic">digerakkan</em> bersama.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-xs text-[0.82rem] leading-relaxed text-[var(--muted)]">
              Sebagian proyek lahir dari tugas kampus, sebagian lagi dari keinginan sederhana untuk
              membuat edukasi kesehatan lebih mudah diakses.
            </p>
          </Reveal>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => {
            const monogram = project.title
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0]?.toUpperCase())
              .join("");
            const link = project.link ? normalizeUrl(project.link) : "";
            return (
              <Reveal key={project.id} delay={index * 0.05} y={18}>
                <article className="project-card h-full">
                  <div className="project-cover">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} loading="lazy" />
                    ) : (
                      <div
                        className="project-cover-art"
                        style={{ background: gradients[index % gradients.length] }}
                      >
                        <span className="project-monogram">{monogram}</span>
                      </div>
                    )}
                    {project.year && <span className="project-year">{project.year}</span>}
                  </div>
                  <div className="project-body">
                    <span className="project-cat">{project.category}</span>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                    <div className="project-tags">
                      {(project.tags ?? []).map((tag) => (
                        <span className="chip !py-1 !text-[0.62rem]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {link ? (
                      <a
                        href={link}
                        target={isExternal(link) ? "_blank" : undefined}
                        rel={isExternal(link) ? "noreferrer noopener" : undefined}
                        className="project-link"
                      >
                        Lihat proyek <ArrowUpRight size={13} />
                      </a>
                    ) : (
                      <span className="project-link cursor-default text-[var(--muted)]">
                        <FolderOpen size={13} /> Studi & dokumentasi
                      </span>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
