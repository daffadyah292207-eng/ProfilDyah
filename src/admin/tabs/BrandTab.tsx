import { useState } from "react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { useAdminToast } from "../AdminContext";
import { Card, Field, ImagePicker, SaveBar, useDraft } from "../ui";
import type { Settings } from "../../types";

export function BrandTab() {
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
      notify("Gagal menyimpan merek: " + saveError.message, "error");
      return;
    }
    await refresh();
    notify("Merek dan logo diperbarui.");
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card title="Identitas merek" description="Dipakai pada navigasi, footer, dan halaman admin.">
        <div className="admin-grid-2">
          <Field label="Nama brand" hint="Contoh: Dyah. atau Dyah Physio.">
            <input
              className="admin-input"
              value={draft.brand_name}
              onChange={(event) => update("brand_name", event.target.value)}
            />
          </Field>
          <Field label="Catatan footer" hint="Satu kalimat pendek di bagian bawah situs.">
            <input
              className="admin-input"
              value={draft.footer_note}
              onChange={(event) => update("footer_note", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Logo" description="Jika kosong, monogram otomatis dibuat dari nama brand.">
        <div className="grid gap-5 sm:grid-cols-[11rem_1fr] sm:items-start">
          <div className="grid place-items-center rounded-[0.9rem] border border-[var(--line)] bg-[var(--bg)] p-5">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-[var(--line-strong)] bg-[var(--surface)]">
              {draft.logo_url ? (
                <img src={draft.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="font-heading text-3xl text-[var(--accent)]">
                  {(draft.brand_name || "D").replace(/\.$/, "").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Pratinjau
            </span>
          </div>
          <ImagePicker
            value={draft.logo_url}
            onChange={(value) => update("logo_url", value)}
            label="File logo"
            maxWidth={512}
            previewClass="h-32"
            hint="Gunakan gambar persegi (1:1) dengan latar transparan atau warna solid."
          />
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
