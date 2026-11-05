import { useState } from "react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { useAdminToast } from "../AdminContext";
import { Card, Field, SaveBar, useDraft } from "../ui";
import type { Settings } from "../../types";

export function HeroTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<Settings>(content.settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft({ ...draft, [key]: value });
  }

  async function save() {
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert({ ...draft, id: 1 });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      notify("Gagal menyimpan hero: " + saveError.message, "error");
      return;
    }
    await refresh();
    notify("Bagian hero diperbarui.");
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card title="Hero" description="Kesan pertama pengunjung. Jaga judul tetap singkat dan kuat.">
        <div className="admin-grid">
          <Field label="Eyebrow" hint="Baris kecil di atas judul.">
            <input
              className="admin-input"
              value={draft.hero_eyebrow}
              onChange={(event) => update("hero_eyebrow", event.target.value)}
            />
          </Field>

          <div className="admin-grid-3">
            <Field label="Judul baris 1">
              <input
                className="admin-input"
                value={draft.hero_title_1}
                onChange={(event) => update("hero_title_1", event.target.value)}
              />
            </Field>
            <Field label="Kata aksen (miring)">
              <input
                className="admin-input"
                value={draft.hero_title_accent}
                onChange={(event) => update("hero_title_accent", event.target.value)}
              />
            </Field>
            <Field label="Judul baris 2">
              <input
                className="admin-input"
                value={draft.hero_title_2}
                onChange={(event) => update("hero_title_2", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Deskripsi hero">
            <textarea
              className="admin-textarea"
              value={draft.hero_description}
              onChange={(event) => update("hero_description", event.target.value)}
            />
          </Field>

          <div className="admin-grid-2">
            <Field label="Label tombol utama">
              <input
                className="admin-input"
                value={draft.cta_primary}
                onChange={(event) => update("cta_primary", event.target.value)}
              />
            </Field>
            <Field label="Label tombol sekunder">
              <input
                className="admin-input"
                value={draft.cta_secondary}
                onChange={(event) => update("cta_secondary", event.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Bagian kontak" description="Judul dan deskripsi ajakan di bagian bawah situs.">
        <div className="admin-grid">
          <Field label="Judul kontak">
            <input
              className="admin-input"
              value={draft.contact_heading}
              onChange={(event) => update("contact_heading", event.target.value)}
            />
          </Field>
          <Field label="Deskripsi kontak">
            <textarea
              className="admin-textarea"
              value={draft.contact_description}
              onChange={(event) => update("contact_description", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Pratinjau judul" description="Tampilan teks hero setelah disimpan.">
        <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--bg)] p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {draft.hero_eyebrow || "Eyebrow"}
          </div>
          <div className="font-heading text-[clamp(1.8rem,4vw,2.8rem)] leading-[0.98] tracking-[-0.04em]">
            <div>{draft.hero_title_1}</div>
            <div>
              <em className="text-[var(--accent)]">{draft.hero_title_accent}</em> {draft.hero_title_2}
            </div>
          </div>
          <p className="mt-3 max-w-lg text-[0.76rem] leading-relaxed text-[var(--muted)]">
            {draft.hero_description}
          </p>
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
