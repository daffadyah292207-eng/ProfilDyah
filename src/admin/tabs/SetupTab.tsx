import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clipboard,
  Database,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import schemaSql from "../../../supabase/schema.sql?raw";
import { useSite } from "../../context/SiteContext";
import { supabase, SUPABASE_URL } from "../../lib/supabase";
import {
  defaultCertifications,
  defaultExperiences,
  defaultProfile,
  defaultProjects,
  defaultSettings,
  defaultSkills,
  defaultSocials,
} from "../../data/defaults";
import { useAdminToast } from "../AdminContext";
import { Card } from "../ui";

function withoutId<T extends { id: string }>(item: T) {
  const copy: Record<string, unknown> = { ...item };
  delete copy.id;
  return copy;
}

export function SetupTab() {
  const { dbStatus, initialized, dbError, refresh } = useSite();
  const { notify } = useAdminToast();
  const [seeding, setSeeding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [seedError, setSeedError] = useState("");
  const [copied, setCopied] = useState(false);

  async function copySql() {
    try {
      await navigator.clipboard.writeText(schemaSql);
      setCopied(true);
      notify("SQL berhasil disalin.", "success");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      notify("Gagal menyalin otomatis. Gunakan tombol unduh.", "error");
    }
  }

  function downloadSql() {
    const blob = new Blob([schemaSql], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "profil-dyah-schema.sql";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function checkConnection() {
    setChecking(true);
    await refresh();
    setChecking(false);
    notify("Status koneksi diperbarui.", "info");
  }

  async function seed() {
    if (
      !window.confirm(
        "Isi konten contoh ke tabel yang masih kosong? Konten yang sudah ada tidak akan ditimpa.",
      )
    ) {
      return;
    }

    setSeeding(true);
    setSeedError("");

    try {
      const { data: profileRow, error: profileError } = await supabase
        .from("site_profile")
        .select("id")
        .eq("id", 1)
        .maybeSingle();
      if (profileError) throw new Error(profileError.message);

      if (!profileRow) {
        const { error } = await supabase
          .from("site_profile")
          .upsert({ ...defaultProfile, id: 1 });
        if (error) throw new Error("site_profile: " + error.message);
      }

      const { data: settingsRow, error: settingsError } = await supabase
        .from("site_settings")
        .select("id")
        .eq("id", 1)
        .maybeSingle();
      if (settingsError) throw new Error(settingsError.message);

      if (!settingsRow) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ ...defaultSettings, id: 1 });
        if (error) throw new Error("site_settings: " + error.message);
      }

      const collections: [string, Record<string, unknown>[]][] = [
        ["skills", defaultSkills.map(withoutId)],
        ["experiences", defaultExperiences.map(withoutId)],
        ["projects", defaultProjects.map(withoutId)],
        ["certifications", defaultCertifications.map(withoutId)],
        ["social_links", defaultSocials.map(withoutId)],
      ];

      for (const [table, rows] of collections) {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) throw new Error(`${table}: ${error.message}`);
        if ((count ?? 0) === 0 && rows.length > 0) {
          const { error: insertError } = await supabase.from(table).insert(rows);
          if (insertError) throw new Error(`${table}: ${insertError.message}`);
        }
      }

      await refresh();
      notify("Konten contoh berhasil dimuat. Silakan edit sesuai data Anda.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setSeedError(message);
      notify("Gagal memuat konten: " + message, "error");
    } finally {
      setSeeding(false);
    }
  }

  const steps = [
    {
      done: dbStatus !== "missing" && dbStatus !== "checking",
      title: "Jalankan skema SQL",
      text: "Buka Supabase → SQL Editor, tempel skrip di bawah, lalu Run. Ini membuat tabel, RLS, dan fungsi admin.",
    },
    {
      done: dbStatus === "ready",
      title: "Klaim admin & isi konten",
      text: "Akun pertama yang login dapat mengklaim akses admin, lalu memuat konten contoh ke database.",
    },
    {
      done: initialized,
      title: "Situs terhubung",
      text: "Setelah konten tersimpan, halaman publik membaca data langsung dari Supabase.",
    },
  ];

  return (
    <div>
      <div className={`admin-note ${dbStatus === "missing" ? "is-warn" : ""} mb-4`}>
        <div className="flex flex-wrap items-center gap-2">
          {dbStatus === "ready" ? (
            <CheckCircle2 size={15} className="text-[var(--accent-2)]" />
          ) : (
            <TriangleAlert size={15} />
          )}
          <strong>
            {dbStatus === "ready"
              ? "Database terhubung dan konten sudah aktif."
              : dbStatus === "empty"
                ? "Tabel siap, tetapi konten belum dimuat."
                : dbStatus === "checking"
                  ? "Memeriksa koneksi…"
                  : "Tabel database belum ditemukan."}
          </strong>
          <button
            type="button"
            className="admin-btn admin-btn-sm ml-auto"
            onClick={() => void checkConnection()}
            disabled={checking}
          >
            {checking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Cek koneksi
          </button>
        </div>
        {dbError && <div className="mt-1.5 break-all text-[0.65rem] opacity-75">{dbError}</div>}
      </div>

      <div className="admin-grid-3 mb-4">
        {steps.map((step, index) => (
          <div className="admin-card !p-4" key={step.title}>
            <div className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[0.62rem] font-extrabold ${
                  step.done
                    ? "bg-[var(--accent-2)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--muted)]"
                }`}
              >
                {step.done ? <Check size={12} /> : index + 1}
              </span>
              <span className="text-[0.76rem] font-extrabold">{step.title}</span>
            </div>
            <p className="mt-2 text-[0.66rem] leading-relaxed text-[var(--muted)]">{step.text}</p>
          </div>
        ))}
      </div>

      <Card
        title="1. Skema database"
        description="Idempotent—aman dijalankan berulang kali. Membuat 9 tabel, kebijakan RLS, dan fungsi claim admin."
        action={
          <div className="admin-toolbar">
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => void copySql()}>
              {copied ? <Check size={12} /> : <Clipboard size={12} />}
              {copied ? "Tersalin" : "Salin SQL"}
            </button>
            <button type="button" className="admin-btn admin-btn-sm" onClick={downloadSql}>
              <Download size={12} /> Unduh
            </button>
            <a
              href="https://supabase.com/dashboard/project/irnxgpyvuugipxswbtmf/sql/new"
              target="_blank"
              rel="noreferrer noopener"
              className="admin-btn admin-btn-sm admin-btn-primary"
            >
              Buka SQL Editor <ExternalLink size={12} />
            </a>
          </div>
        }
      >
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-[0.6rem] border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
            <div className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
              Project URL
            </div>
            <div className="mt-0.5 break-all font-mono text-[0.66rem]">{SUPABASE_URL}</div>
          </div>
          <div className="rounded-[0.6rem] border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
            <div className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
              Auth
            </div>
            <div className="mt-0.5 text-[0.66rem]">
              Email/password aktif · konfirmasi email perlu diverifikasi
            </div>
          </div>
        </div>

        <div className="admin-note is-warn mb-3 !text-[0.68rem]">
          <ShieldCheck size={13} className="mr-1 inline" />
          Kunci publik (publishable key) tidak dapat membuat tabel. Skema harus dijalankan sekali dari
          SQL Editor Supabase. Setelah itu dashboard dapat mengelola semuanya.
        </div>

        <pre className="admin-code">{schemaSql.slice(0, 6000)}{schemaSql.length > 6000 ? "\n\n-- … unduh file lengkap untuk melihat sisanya …" : ""}</pre>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.62rem] text-[var(--muted)]">
          <Database size={12} />
          File lengkap: <code>supabase/schema.sql</code>
          <Link to="/setup" target="_blank" className="font-bold text-[var(--accent)] underline">
            Buka halaman setup publik
          </Link>
        </div>
      </Card>

      <Card
        title="2. Isi konten contoh"
        description="Mengisi tabel yang kosong dengan konten fisioterapi bawaan. Tidak menimpa konten yang sudah ada."
        action={
          <button
            type="button"
            className="admin-btn admin-btn-primary admin-btn-sm"
            onClick={() => void seed()}
            disabled={seeding || dbStatus === "missing"}
          >
            {seeding ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {seeding ? "Memuat konten…" : "Muat konten contoh"}
          </button>
        }
      >
        {seedError && <div className="admin-note is-error mb-3">{seedError}</div>}
        {dbStatus === "missing" && (
          <div className="admin-note is-warn mb-3">
            Jalankan skema SQL terlebih dahulu. Setelah itu muat ulang halaman ini dan tombol seed akan
            aktif.
          </div>
        )}
        <p className="text-[0.7rem] leading-relaxed text-[var(--muted)]">
          Seed mencakup profil, pengaturan tampilan, 10 keahlian, 4 pengalaman, 4 proyek, 4
          sertifikasi, dan 4 tautan sosial. Semua dapat diedit dari menu di sidebar.
        </p>
        {initialized && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[0.66rem] font-semibold text-[var(--accent-2)]">
            <CheckCircle2 size={12} /> Konten sudah pernah dimuat—seed hanya mengisi tabel kosong.
          </p>
        )}
      </Card>

      <Card title="3. Keamanan & akun" description="Hal yang perlu diketahui setelah instalasi.">
        <ul className="grid gap-2 text-[0.72rem] leading-relaxed text-[var(--ink-soft)]">
          <li className="flex gap-2">
            <Check size={13} className="mt-1 shrink-0 text-[var(--accent-2)]" />
            Hanya akun terdaftar di tabel <code>site_admins</code> yang dapat menulis konten. Publik
            hanya bisa membaca dan mengirim pesan.
          </li>
          <li className="flex gap-2">
            <Check size={13} className="mt-1 shrink-0 text-[var(--accent-2)]" />
            Akun admin pertama diklaim melalui fungsi <code>claim_site_admin()</code>. Setelah itu
            klaim ditutup otomatis.
          </li>
          <li className="flex gap-2">
            <Check size={13} className="mt-1 shrink-0 text-[var(--accent-2)]" />
            Jika konfirmasi email aktif, buka tautan di email sebelum masuk. Anda dapat menonaktifkannya
            di Supabase → Authentication → Providers → Email.
          </li>
          <li className="flex gap-2">
            <TriangleAlert size={13} className="mt-1 shrink-0 text-[var(--accent)]" />
            Jangan pernah menaruh service_role key di frontend. Aplikasi ini hanya memakai publishable
            key.
          </li>
        </ul>
      </Card>
    </div>
  );
}
