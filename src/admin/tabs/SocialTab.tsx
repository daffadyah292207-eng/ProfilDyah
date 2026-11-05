import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { useAdminToast } from "../AdminContext";
import { Card, Field, ListControls, SaveBar, useDraft } from "../ui";
import { newId, persistCollection } from "../collection";
import { SOCIAL_OPTIONS } from "../../components/Icons";
import type { SocialLink } from "../../types";

export function SocialTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<SocialLink[]>(content.socials);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, patch: Partial<SocialLink>) {
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
    const item: SocialLink = {
      id: newId(),
      platform: "website",
      label: "Website",
      url: "",
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
      await persistCollection("social_links", normalized, content.socials);
      setDraft(normalized);
      await refresh();
      notify("Tautan sosial berhasil disimpan.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      notify("Gagal menyimpan tautan: " + message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card
        title={`Tautan sosial (${draft.length})`}
        description="Tampil di hero, bagian kontak, dan footer. Gunakan URL lengkap."
        action={
          <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={add}>
            <Plus size={13} /> Tambah tautan
          </button>
        }
      >
        {draft.length === 0 && <div className="admin-hint">Belum ada tautan sosial.</div>}

        {draft.map((item, index) => (
          <div className="admin-list-item" key={item.id}>
            <div className="admin-list-head">
              <span className={`h-2 w-2 rounded-full ${item.visible ? "bg-[var(--accent-2)]" : "bg-[var(--line-strong)]"}`} />
              <span className="min-w-0 flex-1 truncate text-[0.78rem] font-bold">
                {item.label || item.platform}
              </span>
              <span className="chip !py-0.5 !text-[0.58rem]">{item.platform}</span>
              <ListControls
                index={index}
                count={draft.length}
                visible={item.visible}
                onMove={(direction) => move(index, direction)}
                onToggle={() => update(index, { visible: !item.visible })}
                onDelete={() => setDraft(draft.filter((_, itemIndex) => itemIndex !== index))}
              />
            </div>

            <div className="admin-grid-3">
              <Field label="Platform">
                <select
                  className="admin-select"
                  value={item.platform}
                  onChange={(event) => update(index, { platform: event.target.value })}
                >
                  {SOCIAL_OPTIONS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Label">
                <input
                  className="admin-input"
                  value={item.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                />
              </Field>
              <Field label="URL" hint="Email: mailto:alamat@email.com">
                <input
                  className="admin-input"
                  value={item.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="https://linkedin.com/in/…"
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
