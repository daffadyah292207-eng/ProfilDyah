import { Award, ArrowUpRight, Quote } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { Reveal } from "../Reveal";
import { isExternal, normalizeUrl } from "../../lib/utils";

export function Certifications() {
  const { content } = useSite();
  const certifications = content.certifications.filter((item) => item.visible);
  if (certifications.length === 0) return null;

  return (
    <section id="sertifikasi" className="section !pt-0">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="section-label">05 — Sertifikasi</span>
              <h2 className="h2 mt-5">
                Bekal untuk <em className="serif-italic">melangkah</em> lebih percaya diri.
              </h2>
              <p className="mt-4 max-w-sm text-[0.86rem] leading-relaxed text-[var(--muted)]">
                Kursus dan pelatihan yang memperkuat fondasi klinis—bukan sekadar sertifikat, tapi
                keterampilan yang terus saya ulang dan uji.
              </p>
            </div>
          </Reveal>

          <div className="cert-grid !mt-0">
            {certifications.map((cert, index) => {
              const link = cert.credential_url ? normalizeUrl(cert.credential_url) : "";
              return (
                <Reveal key={cert.id} delay={index * 0.04} y={14}>
                  <div className="cert-card h-full">
                    <span className="cert-icon">
                      <Award size={17} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="cert-title">{cert.title}</h3>
                      <div className="cert-meta">
                        {cert.issuer}
                        {cert.year ? ` · ${cert.year}` : ""}
                      </div>
                      {link && (
                        <a
                          href={link}
                          target={isExternal(link) ? "_blank" : undefined}
                          rel={isExternal(link) ? "noreferrer noopener" : undefined}
                          className="link-underline mt-2 !text-[0.66rem] text-[var(--accent)]"
                        >
                          Lihat kredensial <ArrowUpRight size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="quote-block">
            <Quote size={22} className="relative mb-4 text-[color-mix(in_srgb,var(--bg)_50%,transparent)]" />
            <blockquote>
              Pemulihan bukan perlombaan. Ia adalah percakapan antara tubuh, waktu, dan{" "}
              <em>kepercayaan</em> yang dibangun perlahan.
            </blockquote>
            <div className="quote-by">Filosofi kerja</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
