import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { useAdminToast } from "../AdminContext";
import { Card, Field, ListControls, SaveBar, useDraft } from "../ui";
import { newId, persistCollection } from "../collection";
import { SKILL_ICON_OPTIONS } from "../../components/Icons";
import type { Skill } from "../../types";

export function SkillsTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<Skill[]>(content.skills);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, patch: Partial<Skill>) {
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
    const item: Skill = {
      id: newId(),
      name: "Keahlian baru",
      category: "Klinis",
      level: 70,
      description: "",
      icon: "Activity",
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
      await persistCollection("skills", normalized, content.skills);
      setDraft(normalized);
      await refresh();
      notify("Keahlian berhasil disimpan.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      notify("Gagal menyimpan keahlian: " + message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card
        title={`Daftar keahlian (${draft.length})`}
        description="Tampil seperti endorsement LinkedIn: kategori, level, dan deskripsi singkat."
        action={
          <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={add}>
            <Plus size={13} /> Tambah keahlian
          </button>
        }
      >
        {draft.length === 0 && (
          <div className="admin-hint">Belum ada keahlian. Tambahkan yang pertama.</div>
        )}

        {draft.map((skill, index) => (
          <div className="admin-list-item" key={skill.id}>
            <div className="admin-list-head">
              <span className={`h-2 w-2 rounded-full ${skill.visible ? "bg-[var(--accent-2)]" : "bg-[var(--line-strong)]"}`} />
              <span className="min-w-0 flex-1 truncate text-[0.78rem] font-bold">
                {skill.name || "Tanpa nama"}
              </span>
              {skill.id.startsWith("new-") && <span className="tag">Baru</span>}
              <ListControls
                index={index}
                count={draft.length}
                visible={skill.visible}
                onMove={(direction) => move(index, direction)}
                onToggle={() => update(index, { visible: !skill.visible })}
                onDelete={() => setDraft(draft.filter((_, itemIndex) => itemIndex !== index))}
              />
            </div>

            <div className="admin-grid-2">
              <Field label="Nama keahlian">
                <input
                  className="admin-input"
                  value={skill.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                />
              </Field>
              <Field label="Kategori">
                <input
                  className="admin-input"
                  value={skill.category}
                  onChange={(event) => update(index, { category: event.target.value })}
                  placeholder="Klinis, Asesmen, Soft Skill…"
                />
              </Field>
              <Field label="Ikon">
                <select
                  className="admin-select"
                  value={skill.icon}
                  onChange={(event) => update(index, { icon: event.target.value })}
                >
                  {SKILL_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Level — ${skill.level}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={skill.level}
                  onChange={(event) => update(index, { level: Number(event.target.value) })}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
              <Field label="Deskripsi singkat" full>
                <textarea
                  className="admin-textarea"
                  value={skill.description}
                  onChange={(event) => update(index, { description: event.target.value })}
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
