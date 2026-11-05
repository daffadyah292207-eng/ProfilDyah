import { useState, type CSSProperties } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { useAdminToast } from "../AdminContext";
import { Card, ColorField, Field, SaveBar, Toggle, useDraft } from "../ui";
import type { FontStyle, Settings, ThemeMode } from "../../types";

const presets = [
  { name: "Samudra", accent: "#0B6E99", secondary: "#2C9BCB" },
  { name: "Langit", accent: "#1D7FB8", secondary: "#6CC7EE" },
  { name: "Nautika", accent: "#0A5C7A", secondary: "#2FA8C9" },
  { name: "Fajar", accent: "#2A6F97", secondary: "#89C2D9" },
  { name: "Malam", accent: "#1E3A5F", secondary: "#4B9CD3" },
];

const fontOptions: Record<
  FontStyle,
  { label: string; note: string; heading: string; body: string }
> = {
  editorial: {
    label: "Samudra",
    note: "Plus Jakarta Sans + DM Sans",
    heading: '"Plus Jakarta Sans", sans-serif',
    body: '"DM Sans", sans-serif',
  },
  modern: {
    label: "Neo",
    note: "Sora + Manrope",
    heading: '"Sora", sans-serif',
    body: '"Manrope", sans-serif',
  },
  classic: {
    label: "Klasik",
    note: "Playfair Display + DM Sans",
    heading: '"Playfair Display", Georgia, serif',
    body: '"DM Sans", sans-serif',
  },
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
    background: draft.theme_mode === "dark" ? "#061826" : "#f2f8fd",
    color: draft.theme_mode === "dark" ? "#eaf6fd" : "#08243a",
    ["--preview-accent" as string]: draft.accent,
    ["--preview-secondary" as string]: draft.accent_secondary,
  } as CSSProperties;
  const activeFont = fontOptions[draft.font_style];
  const previewAccent =
    draft.theme_mode === "dark"
      ? `color-mix(in srgb, ${draft.accent} 58%, #c9efff)`
      : draft.accent;
  const previewAccentInk = draft.theme_mode === "dark" ? "#04111c" : "#f6fcff";

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
            <div className="grid gap-1.5">
              {(Object.keys(fontOptions) as FontStyle[]).map((value) => {
                const option = fontOptions[value];
                const active = draft.font_style === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("font_style", value)}
                    className={`flex items-center gap-3 rounded-[0.7rem] border px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)] hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[1.1rem] font-semibold leading-none"
                      style={{ fontFamily: option.heading }}
                    >
                      Aa
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.72rem] font-extrabold">{option.label}</span>
                      <span className="block truncate text-[0.6rem] text-[var(--muted)]">
                        {option.note}
                      </span>
                    </span>
                    {active && <Check size={12} className="shrink-0 text-[var(--accent)]" />}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <p className="mt-2 text-[0.64rem] leading-relaxed text-[var(--muted)]">
          Font dipakai untuk judul dan teks isi situs, tersimpan ke database, dan langsung berlaku
          untuk semua pengunjung.
        </p>

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
              style={{ background: previewAccent, color: previewAccentInk }}
            >
              Preview
            </span>
          </div>
          <div
            className="mt-6 text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.02] tracking-[-0.04em]"
            style={{ fontFamily: activeFont.heading, fontWeight: 650 }}
          >
            Mengembalikan{" "}
            <em style={{ color: previewAccent, fontStyle: "italic" }}>gerak,</em>
            <br />
            merawat hidup.
          </div>
          <p
            className="mt-3 max-w-md text-[0.75rem] leading-relaxed opacity-65"
            style={{ fontFamily: activeFont.body }}
          >
            {draft.hero_description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1.5 text-[0.65rem] font-bold"
              style={{ background: previewAccent, color: previewAccentInk }}
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
