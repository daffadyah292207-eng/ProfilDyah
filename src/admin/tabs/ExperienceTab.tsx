import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { useAdminToast } from "../AdminContext";
import { Card, Field, LinesEditor, ListControls, SaveBar, useDraft } from "../ui";
import { newId, persistCollection } from "../collection";
import type { Experience, ExperienceKind } from "../../types";

const kinds: ExperienceKind[] = ["Pendidikan", "Pengalaman", "Organisasi"];

export function ExperienceTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<Experience[]>(content.experiences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, patch: Partial<Experience>) {
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
    const item: Experience = {
      id: newId(),
      kind: "Pengalaman",
      title: "Pengalaman baru",
      organization: "",
      location: "",
      period: "",
      description: "",
      highlights: [],
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
      await persistCollection("experiences", normalized, content.experiences);
      setDraft(normalized);
      await refresh();
      notify("Pengalaman berhasil disimpan.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      notify("Gagal menyimpan pengalaman: " + message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card
        title={`Timeline perjalanan (${draft.length})`}
        description="Urutan dari atas ke bawah. Kategori menentukan ikon pada situs."
        action={
          <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={add}>
            <Plus size={13} /> Tambah
          </button>
        }
      >
        {draft.length === 0 && <div className="admin-hint">Belum ada pengalaman.</div>}

        {draft.map((item, index) => (
          <div className="admin-list-item" key={item.id}>
            <div className="admin-list-head">
              <span className={`h-2 w-2 rounded-full ${item.visible ? "bg-[var(--accent-2)]" : "bg-[var(--line-strong)]"}`} />
              <span className="min-w-0 flex-1 truncate text-[0.78rem] font-bold">
                {item.title || "Tanpa judul"}
              </span>
              <span className="chip !py-0.5 !text-[0.58rem]">{item.kind}</span>
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
              <Field label="Kategori">
                <select
                  className="admin-select"
                  value={item.kind}
                  onChange={(event) => update(index, { kind: event.target.value as ExperienceKind })}
                >
                  {kinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Periode" hint="Contoh: 2023 — Sekarang">
                <input
                  className="admin-input"
                  value={item.period}
                  onChange={(event) => update(index, { period: event.target.value })}
                />
              </Field>
              <Field label="Judul">
                <input
                  className="admin-input"
                  value={item.title}
                  onChange={(event) => update(index, { title: event.target.value })}
                />
              </Field>
              <Field label="Institusi / organisasi">
                <input
                  className="admin-input"
                  value={item.organization}
                  onChange={(event) => update(index, { organization: event.target.value })}
                />
              </Field>
              <Field label="Lokasi">
                <input
                  className="admin-input"
                  value={item.location}
                  onChange={(event) => update(index, { location: event.target.value })}
                />
              </Field>
              <Field label="Deskripsi" full>
                <textarea
                  className="admin-textarea"
                  value={item.description}
                  onChange={(event) => update(index, { description: event.target.value })}
                />
              </Field>
              <div className="is-full">
                <LinesEditor
                  label="Poin pencapaian"
                  value={item.highlights ?? []}
                  onChange={(value) => update(index, { highlights: value })}
                  hint="Satu poin per baris. Tampil sebagai tag kecil."
                />
              </div>
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
