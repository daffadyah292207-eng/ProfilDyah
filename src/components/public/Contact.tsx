import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { Reveal } from "../Reveal";
import { SocialIcon } from "../Icons";
import { isExternal, normalizeUrl } from "../../lib/utils";

type Status = "idle" | "sending" | "success" | "error";

export function Contact() {
  const { content } = useSite();
  const { profile, settings } = content;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });

  const socials = content.socials.filter((item) => item.visible && item.url);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.website) return;

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setError("Nama, email, dan pesan wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus("error");
      setError("Format email belum tepat.");
      return;
    }

    setStatus("sending");
    setError("");

    const { error: insertError } = await supabase.from("messages").insert({
      name: form.name.trim().slice(0, 120),
      email: form.email.trim().slice(0, 160),
      subject: form.subject.trim().slice(0, 160),
      message: form.message.trim().slice(0, 4000),
    });

    if (insertError) {
      setStatus("error");
      setError(
        "Pesan belum terkirim. Database mungkin belum disiapkan—silakan hubungi lewat email.",
      );
      return;
    }

    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "", website: "" });
  }

  return (
    <section id="kontak" className="section">
      <div className="container-x">
        <div className="contact-grid">
          <Reveal>
            <span className="section-label">06 — Kontak</span>
            <h2 className="h2 mt-5">{settings.contact_heading || "Mari bergerak bersama."}</h2>
            <p className="lead mt-4 max-w-md">{settings.contact_description}</p>

            <div className="mt-7">
              {profile.email && (
                <div className="contact-detail">
                  <span className="cd-icon">
                    <Mail size={17} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <div className="cd-label">Email</div>
                    <a href={`mailto:${profile.email}`} className="cd-value hover:text-[var(--accent)]">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="contact-detail">
                  <span className="cd-icon">
                    <Phone size={17} strokeWidth={1.7} />
                  </span>
                  <div>
                    <div className="cd-label">Telepon</div>
                    <a
                      href={`tel:${profile.phone.replace(/\s/g, "")}`}
                      className="cd-value hover:text-[var(--accent)]"
                    >
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="contact-detail">
                <span className="cd-icon">
                  <MapPin size={17} strokeWidth={1.7} />
                </span>
                <div>
                  <div className="cd-label">Berbasis di</div>
                  <div className="cd-value">{profile.location || "Indonesia"}</div>
                </div>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
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
            )}

            <div className="mt-7 flex items-center gap-2 text-[0.7rem] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
              Biasanya membalas dalam 1–2 hari kerja.
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="contact-card" noValidate>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="h3 text-[1.2rem]">Kirim pesan</h3>
                  <p className="mt-0.5 text-[0.7rem] text-[var(--muted)]">
                    Ceritakan kebutuhan atau ide kolaborasi Anda.
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Send size={15} />
                </span>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label" htmlFor="contact-name">
                    Nama
                  </label>
                  <input
                    id="contact-name"
                    className="input"
                    placeholder="Nama Anda"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div className="form-field is-full">
                  <label className="form-label" htmlFor="contact-subject">
                    Subjek
                  </label>
                  <input
                    id="contact-subject"
                    className="input"
                    placeholder="Kolaborasi, pertanyaan, atau lainnya"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  />
                </div>
                <div className="form-field is-full">
                  <label className="form-label" htmlFor="contact-message">
                    Pesan
                  </label>
                  <textarea
                    id="contact-message"
                    className="textarea"
                    placeholder="Tulis pesan Anda di sini…"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                  />
                </div>
              </div>

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
                className="hidden"
                aria-hidden="true"
              />

              {status === "error" && (
                <div className="admin-note is-error mt-4" role="alert">
                  {error}{" "}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="font-bold underline">
                      {profile.email}
                    </a>
                  )}
                </div>
              )}

              {status === "success" && (
                <div className="admin-note mt-4 flex items-center gap-2" role="status">
                  <CheckCircle2 size={15} className="shrink-0 text-[var(--accent-2)]" />
                  Pesan terkirim. Terima kasih—saya akan membalas secepatnya.
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="form-note !mt-0">Data Anda hanya digunakan untuk membalas pesan.</span>
                <button
                  type="submit"
                  className="btn btn-accent btn-sm"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Mengirim
                    </>
                  ) : (
                    <>
                      Kirim pesan <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
