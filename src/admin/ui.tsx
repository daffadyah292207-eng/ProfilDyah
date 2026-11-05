import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload, ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { dataUrlSize, fileToDataUrl, formatBytes } from "../lib/images";
import { useAdminDirty } from "./AdminContext";
import { cn } from "../lib/utils";

export function Field({
  label,
  hint,
  full,
  children,
  className,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("admin-field", full && "is-full", className)}>
      <span className="admin-label">{label}</span>
      {children}
      {hint && <span className="admin-hint">{hint}</span>}
    </label>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("admin-card", className)}>
      {(title || action) && (
        <div className="admin-card-head">
          <div>
            {title && <h2 className="admin-card-title">{title}</h2>}
            {description && <p className="admin-card-desc">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  label = "Simpan perubahan",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  label?: string;
}) {
  return (
    <div className="admin-savebar">
      <div className="flex items-center gap-2 text-[0.72rem]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dirty ? "bg-[var(--accent)]" : "bg-[var(--accent-2)]",
          )}
        />
        {dirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan tersimpan."}
      </div>
      <div className="admin-toolbar">
        <button type="button" className="admin-btn" onClick={onReset} disabled={!dirty || saving}>
          Batalkan
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={onSave}
          disabled={!dirty || saving}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Menyimpan…" : label}
        </button>
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[0.7rem] border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5">
      <div>
        <div className="text-[0.78rem] font-bold">{label}</div>
        {description && <div className="mt-0.5 text-[0.65rem] text-[var(--muted)]">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--line-strong)] bg-[var(--surface)]",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition-all",
            checked ? "left-[1.1rem]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function ImagePicker({
  value,
  onChange,
  label = "Gambar",
  hint = "JPG, PNG, atau WebP. Gambar akan dikompres otomatis.",
  maxWidth = 1200,
  previewClass = "h-36",
  savedValue,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  maxWidth?: number;
  previewClass?: string;
  /** Nilai yang sudah tersimpan di database. Dipakai untuk menandai pratinjau yang belum disimpan. */
  savedValue?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const persisted = savedValue ?? value;
  const changed = value !== persisted;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await fileToDataUrl(file, { maxWidth, maxHeight: maxWidth, quality: 0.84 });
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses gambar.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="admin-field is-full">
      <span className="admin-label">{label}</span>
      <div className="admin-image-picker">
        <div
          className={cn(
            "admin-image-preview relative grid place-items-center overflow-hidden rounded-[0.55rem] border border-dashed bg-[var(--surface)]",
            changed ? "border-[var(--accent)]" : "border-[var(--line-strong)]",
            previewClass,
          )}
        >
          {value ? (
            <img src={value} alt="Pratinjau" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[var(--muted)]">
              <ImagePlus size={22} strokeWidth={1.5} />
              <span className="text-[0.66rem] font-semibold">Belum ada gambar</span>
            </div>
          )}

          {changed && (
            <span className="admin-image-badge">
              {value ? "Pratinjau baru · belum disimpan" : "Akan dihapus saat disimpan"}
            </span>
          )}

          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-[var(--surface)]/75">
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="admin-btn admin-btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Upload size={12} /> Unggah
          </button>
          {value && (
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-danger"
              onClick={() => onChange("")}
            >
              <Trash2 size={12} /> Hapus foto
            </button>
          )}
          {changed && persisted && (
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => onChange(persisted)}
            >
              Batalkan foto baru
            </button>
          )}
          {value.startsWith("data:") && (
            <span className="text-[0.6rem] text-[var(--muted)]">
              {formatBytes(dataUrlSize(value))}
            </span>
          )}
          <span className="ml-auto text-[0.6rem] text-[var(--muted)]">atau tempel URL ↓</span>
        </div>

        {changed && (
          <div className="admin-image-status">
            {!value
              ? "Foto akan dihapus dari database setelah Anda mengklik Simpan perubahan."
              : persisted
                ? "Foto baru belum tersimpan. Klik Simpan perubahan untuk menerapkan. Foto lama akan diganti dan dihapus dari database."
                : "Foto baru belum tersimpan. Klik Simpan perubahan untuk menyimpannya ke database."}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5">
          <Link2 size={13} className="shrink-0 text-[var(--muted)]" />
          <input
            className="admin-input !py-1.5 !text-[0.72rem]"
            placeholder="https://… / data:image/…"
            value={value.startsWith("data:") ? "" : value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
        {error && <div className="admin-note is-error mt-2 !text-[0.65rem]">{error}</div>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>
      <span className="admin-hint">{hint}</span>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="admin-field">
      <span className="admin-label">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
          aria-label={label}
        />
        <input
          className="admin-input !font-mono !text-[0.72rem]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {hint && <span className="admin-hint">{hint}</span>}
    </div>
  );
}

export function LinesEditor({
  label,
  value,
  onChange,
  hint = "Satu item per baris.",
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint} full>
      <textarea
        className="admin-textarea"
        value={(value ?? []).join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trimStart())
              .filter((line) => line.trim().length > 0),
          )
        }
        placeholder={placeholder}
      />
    </Field>
  );
}

export function ListControls({
  index,
  count,
  visible,
  onMove,
  onToggle,
  onDelete,
}: {
  index: number;
  count: number;
  visible: boolean;
  onMove: (direction: -1 | 1) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="admin-icon-btn"
        onClick={onToggle}
        title={visible ? "Sembunyikan dari situs" : "Tampilkan di situs"}
        aria-label={visible ? "Sembunyikan" : "Tampilkan"}
      >
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <button
        type="button"
        className="admin-icon-btn"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Naikkan"
        title="Naikkan"
      >
        <ArrowUp size={13} />
      </button>
      <button
        type="button"
        className="admin-icon-btn"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label="Turunkan"
        title="Turunkan"
      >
        <ArrowDown size={13} />
      </button>
      <button
        type="button"
        className="admin-icon-btn danger"
        onClick={onDelete}
        aria-label="Hapus"
        title="Hapus"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function useDraft<T>(source: T) {
  const sourceKey = JSON.stringify(source);
  const [draft, setDraft] = useState<T>(source);
  const [baseline, setBaseline] = useState(sourceKey);
  const dirty = JSON.stringify(draft) !== baseline;

  useAdminDirty(dirty);

  useEffect(() => {
    setDraft(source);
    setBaseline(sourceKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  return {
    draft,
    setDraft,
    dirty,
    reset: () => setDraft(source),
  };
}
