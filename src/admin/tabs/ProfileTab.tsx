import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { supabase } from "../../lib/supabase";
import { deleteReplacedImage } from "../../lib/images";
import { useAdminToast } from "../AdminContext";
import { Card, Field, ImagePicker, LinesEditor, SaveBar, useDraft } from "../ui";
import type { Profile, StatItem } from "../../types";

export function ProfileTab() {
  const { content, refresh } = useSite();
  const { notify } = useAdminToast();
  const { draft, setDraft, dirty, reset } = useDraft<Profile>(content.profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft({ ...draft, [key]: value });
  }

  function updateStat(index: number, key: keyof StatItem, value: string) {
    const stats = (draft.stats ?? []).map((stat, statIndex) =>
      statIndex === index ? { ...stat, [key]: value } : stat,
    );
    update("stats", stats);
  }

  function removeStat(index: number) {
    update(
      "stats",
      (draft.stats ?? []).filter((_, statIndex) => statIndex !== index),
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    const previousPhoto = content.profile.photo_url;
    const { error: saveError } = await supabase
      .from("site_profile")
      .upsert({ ...draft, id: 1 });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      notify("Gagal menyimpan profil: " + saveError.message, "error");
      return;
    }
    await deleteReplacedImage(previousPhoto, draft.photo_url);
    await refresh();
    notify(
      draft.photo_url !== previousPhoto && draft.photo_url
        ? "Profil tersimpan. Foto lama sudah diganti dan dihapus dari database."
        : draft.photo_url !== previousPhoto
          ? "Profil tersimpan. Foto profil dihapus dari database."
          : "Profil berhasil diperbarui.",
    );
  }

  return (
    <div>
      {error && <div className="admin-note is-error mb-4">{error}</div>}

      <Card title="Identitas" description="Nama dan peran yang tampil di seluruh situs.">
        <div className="admin-grid-2">
          <Field label="Nama lengkap">
            <input
              className="admin-input"
              value={draft.full_name}
              onChange={(event) => update("full_name", event.target.value)}
            />
          </Field>
          <Field label="Nama panggilan">
            <input
              className="admin-input"
              value={draft.nickname}
              onChange={(event) => update("nickname", event.target.value)}
            />
          </Field>
          <Field label="Peran / profesi">
            <input
              className="admin-input"
              value={draft.role}
              onChange={(event) => update("role", event.target.value)}
            />
          </Field>
          <Field label="Status ketersediaan" hint="Tampil sebagai badge di hero.">
            <input
              className="admin-input"
              value={draft.availability}
              onChange={(event) => update("availability", event.target.value)}
            />
          </Field>
          <Field label="Universitas / program studi">
            <input
              className="admin-input"
              value={draft.university}
              onChange={(event) => update("university", event.target.value)}
            />
          </Field>
          <Field label="Semester">
            <input
              className="admin-input"
              value={draft.semester}
              onChange={(event) => update("semester", event.target.value)}
            />
          </Field>
          <Field label="Lokasi">
            <input
              className="admin-input"
              value={draft.location}
              onChange={(event) => update("location", event.target.value)}
            />
          </Field>
          <Field label="Email publik">
            <input
              type="email"
              className="admin-input"
              value={draft.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field label="Telepon / WhatsApp">
            <input
              className="admin-input"
              value={draft.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          <Field label="Link CV" hint="URL Google Drive, PDF, atau LinkedIn.">
            <input
              className="admin-input"
              value={draft.cv_url}
              onChange={(event) => update("cv_url", event.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      </Card>

      <Card title="Foto profil" description="Unggah foto potret. Rasio ideal 4:5 (portrait).">
        <ImagePicker
          value={draft.photo_url}
          savedValue={content.profile.photo_url}
          onChange={(value) => update("photo_url", value)}
          label="Foto hero"
          maxWidth={1100}
          previewClass="h-56"
          hint="Kosongkan untuk memakai ilustrasi abstrak bawaan. Foto disimpan sebagai data URL yang dikompres."
        />
      </Card>

      <Card title="Cerita & tagline" description="Teks yang membangun koneksi dengan pengunjung.">
        <div className="admin-grid">
          <Field label="Tagline" hint="Tampil sebagai judul besar di bagian Tentang.">
            <input
              className="admin-input"
              value={draft.tagline}
              onChange={(event) => update("tagline", event.target.value)}
            />
          </Field>
          <Field label="Bio singkat">
            <textarea
              className="admin-textarea"
              value={draft.bio}
              onChange={(event) => update("bio", event.target.value)}
            />
          </Field>
          <Field label="Cerita lengkap">
            <textarea
              className="admin-textarea"
              value={draft.long_bio}
              onChange={(event) => update("long_bio", event.target.value)}
            />
          </Field>
          <LinesEditor
            label="Fokus / bidang minat"
            value={draft.focus ?? []}
            onChange={(value) => update("focus", value)}
            placeholder={"Rehabilitasi muskuloskeletal\nTerapi manual"}
          />
        </div>
      </Card>

      <Card
        title="Statistik singkat"
        description="Maksimal 4 angka yang tampil di bawah foto hero."
        action={
          (draft.stats ?? []).length < 4 ? (
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => update("stats", [...(draft.stats ?? []), { label: "Label", value: "0" }])}
            >
              <Plus size={12} /> Tambah
            </button>
          ) : undefined
        }
      >
        {(draft.stats ?? []).length === 0 && (
          <div className="admin-hint">Belum ada statistik. Tambahkan satu untuk memperkuat hero.</div>
        )}
        <div className="grid gap-2">
          {(draft.stats ?? []).map((stat, index) => (
            <div className="admin-grid-3 items-end" key={index}>
              <Field label="Nilai">
                <input
                  className="admin-input"
                  value={stat.value}
                  onChange={(event) => updateStat(index, "value", event.target.value)}
                />
              </Field>
              <Field label="Label">
                <input
                  className="admin-input"
                  value={stat.label}
                  onChange={(event) => updateStat(index, "label", event.target.value)}
                />
              </Field>
              <button
                type="button"
                className="admin-btn admin-btn-danger !h-[2.15rem]"
                onClick={() => removeStat(index)}
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          ))}
        </div>
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
