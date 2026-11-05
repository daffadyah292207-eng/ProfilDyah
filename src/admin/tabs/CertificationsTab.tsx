import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { useAdminToast } from "../AdminContext";
import { Card, Field, ListControls, SaveBar, useDraft } from "../ui";
import { newId, persistCollection } from "../collection";
import type { Certification } from "../../types";

export function CertificationsTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<Certification[]>(content.certifications);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, patch: Partial<Certification>) {
    setDraft(draft.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setDraft(next.map((entry, order) => ({ ...entry, sort_order: order + 1 })));
  }

  function add() {
    const item: Certification = {
      id: newId(),
      title: "Sertifikasi baru",
      issuer: "",
      year: String(new Date().getFullYear()),
      credential_url: "",
      sort_order: draft.length + 1,
      visible: true,
    };
    setDraft([...draft, item]);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const normalized = draft.map((item, index) => ({ ...item, sort_order: index + 1 }));
      await persistCollection("certifications", normalized, content.certifications);
      setDraft(normalized);
      await refresh();
      notify("Sertifikasi berhasil disimpan.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      notify("Gagal menyimpan sertifikasi: " + message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card
        title={`Sertifikasi (${draft.length})`}
        description="Pelatihan, kursus, dan kredensial yang mendukung kompetensi."
        action={
          <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={add}>
            <Plus size={13} /> Tambah
          </button>
        }
      >
        {draft.length === 0 && <div className="admin-hint">Belum ada sertifikasi.</div>}

        {draft.map((item, index) => (
          <div className="admin-list-item" key={item.id}>
            <div className="admin-list-head">
              <span className={`h-2 w-2 rounded-full ${item.visible ? "bg-[var(--accent-2)]" : "bg-[var(--line-strong)]"}`} />
              <span className="min-w-0 flex-1 truncate text-[0.78rem] font-bold">
                {item.title || "Tanpa judul"}
              </span>
              <span className="chip !py-0.5 !text-[0.58rem]">{item.year || "—"}</span>
              <ListControls
                index={index}
                count={draft.length}
                visible={item.visible}
                onMove={(direction) => move(index, direction)}
                onToggle={() => update(index, { visible: !item.visible })}
                onDelete={() => setDraft(draft.filter((_, itemIndex) => itemIndex !== index))}
              />
            </div>

            <div className="admin-grid-2">
              <Field label="Nama sertifikasi">
                <input
                  className="admin-input"
                  value={item.title}
                  onChange={(event) => update(index, { title: event.target.value })}
                />
              </Field>
              <Field label="Penerbit">
                <input
                  className="admin-input"
                  value={item.issuer}
                  onChange={(event) => update(index, { issuer: event.target.value })}
                />
              </Field>
              <Field label="Tahun">
                <input
                  className="admin-input"
                  value={item.year}
                  onChange={(event) => update(index, { year: event.target.value })}
                />
              </Field>
              <Field label="URL kredensial" hint="Opsional.">
                <input
                  className="admin-input"
                  value={item.credential_url}
                  onChange={(event) => update(index, { credential_url: event.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </div>
        ))}
      </Card>

      {saving && (
        <div className="mt-3 flex items-center gap-2 text-[0.7rem] text-[var(--muted)]">
          <Loader2 size={13} className="animate-spin" /> Menyimpan…
        </div>
      )}

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
