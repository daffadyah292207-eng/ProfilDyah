import { useState, type CSSProperties } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { useAdminToast } from "../AdminContext";
import { Card, ColorField, Field, SaveBar, Toggle, useDraft } from "../ui";
import type { FontStyle, Settings, ThemeMode } from "../../types";

const presets = [
  { name: "Terracotta", accent: "#C85834", secondary: "#2F6B5A" },
  { name: "Hutan", accent: "#3D7A5F", secondary: "#A56C3D" },
  { name: "Samudra", accent: "#3D6F8E", secondary: "#C27A4A" },
  { name: "Mawar", accent: "#B85C6B", secondary: "#4F6B5E" },
  { name: "Senja", accent: "#9A5B3C", secondary: "#6B5B8E" },
];

const fontLabels: Record<FontStyle, string> = {
  editorial: "Editorial — Fraunces + Manrope",
  modern: "Modern — Sora + Manrope",
  classic: "Klasik — Playfair Display + DM Sans",
};

const fontStacks: Record<FontStyle, string> = {
  editorial: '"Fraunces", Georgia, serif',
  modern: '"Sora", sans-serif',
  classic: '"Playfair Display", Georgia, serif',
};

export function AppearanceTab() {
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
      notify("Gagal menyimpan tampilan: " + saveError.message, "error");
      return;
    }
    await refresh();
    notify("Tampilan situs diperbarui.");
  }

  const previewStyle = {
    background: draft.theme_mode === "dark" ? "#0e1714" : "#f5f0e6",
    color: draft.theme_mode === "dark" ? "#f4efe5" : "#14211d",
    ["--preview-accent" as string]: draft.accent,
    ["--preview-secondary" as string]: draft.accent_secondary,
  } as CSSProperties;

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card title="Mode & palet" description="Perubahan berlaku untuk seluruh halaman publik.">
        <div className="admin-grid-2">
          <Field label="Mode tampilan">
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as ThemeMode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update("theme_mode", value)}
                  className={`admin-btn justify-center ${draft.theme_mode === value ? "!border-[var(--accent)] !bg-[var(--accent-soft)] !text-[var(--accent)]" : ""}`}
                >
                  {value === "light" ? <Sun size={14} /> : <Moon size={14} />}
                  {value === "light" ? "Terang" : "Gelap"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Pasangan font">
            <select
              className="admin-select"
              value={draft.font_style}
              onChange={(event) => update("font_style", event.target.value as FontStyle)}
            >
              {(Object.keys(fontLabels) as FontStyle[]).map((value) => (
                <option key={value} value={value}>
                  {fontLabels[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <span className="admin-label">Preset warna</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, accent: preset.accent, accent_secondary: preset.secondary })
                }
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors ${
                  draft.accent.toLowerCase() === preset.accent.toLowerCase()
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                <span className="flex items-center gap-0.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ background: preset.accent }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ background: preset.secondary }}
                  />
                </span>
                {preset.name}
                {draft.accent.toLowerCase() === preset.accent.toLowerCase() && <Check size={11} />}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-grid-2 mt-4">
          <ColorField
            label="Warna aksen"
            value={draft.accent}
            onChange={(value) => update("accent", value)}
            hint="Digunakan untuk tombol, garis, dan penekanan."
          />
          <ColorField
            label="Warna sekunder"
            value={draft.accent_secondary}
            onChange={(value) => update("accent_secondary", value)}
            hint="Digunakan untuk ikon keahlian dan aksen lembut."
          />
        </div>
      </Card>

      <Card title="Tekstur" description="Detail kecil yang memberi karakter pada halaman.">
        <Toggle
          checked={draft.grain}
          onChange={(value) => update("grain", value)}
          label="Tekstur grain"
          description="Menambahkan noise halus di atas permukaan situs."
        />
      </Card>

      <Card title="Pratinjau" description="Gambaran cepat kombinasi warna dan tipografi.">
        <div
          className="overflow-hidden rounded-[1rem] border border-[var(--line)] p-6"
          style={previewStyle}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] opacity-60">
              {draft.brand_name || "Dyah."}
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em]"
              style={{ background: draft.accent, color: "#fff9f3" }}
            >
              Preview
            </span>
          </div>
          <div
            className="mt-6 text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.02] tracking-[-0.04em]"
            style={{ fontFamily: fontStacks[draft.font_style] }}
          >
            Mengembalikan <em style={{ color: draft.accent }}>gerak,</em>
            <br />
            merawat hidup.
          </div>
          <p className="mt-3 max-w-md text-[0.75rem] leading-relaxed opacity-65">
            {draft.hero_description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1.5 text-[0.65rem] font-bold"
              style={{ background: draft.accent, color: "#fff9f3" }}
            >
              {draft.cta_primary || "Kenali saya"}
            </span>
            <span
              className="rounded-full border px-3 py-1.5 text-[0.65rem] font-bold"
              style={{ borderColor: draft.accent_secondary, color: draft.accent_secondary }}
            >
              {draft.cta_secondary || "Mari terhubung"}
            </span>
            <span
              className="rounded-full px-2.5 py-1.5 text-[0.6rem] font-bold"
              style={{ background: `${draft.accent_secondary}22`, color: draft.accent_secondary }}
            >
              Fisioterapi
            </span>
          </div>
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
