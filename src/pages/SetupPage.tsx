import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Database,
  Download,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import schemaSql from "../../supabase/schema.sql?raw";
import { useSite } from "../context/SiteContext";
import { Logo } from "../components/Logo";
import { SUPABASE_URL } from "../lib/supabase";

export function SetupPage() {
  const { content, dbStatus, dbError, refresh } = useSite();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function download() {
    const blob = new Blob([schemaSql], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "profil-dyah-schema.sql";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function check() {
    setChecking(true);
    await refresh();
    setChecking(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/50 backdrop-blur">
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4">
          <Logo
            brand={content.settings.brand_name || "Dyah."}
            logoUrl={content.settings.logo_url}
            size="sm"
          />
          <div className="flex items-center gap-2">
            <Link to="/admin" className="btn btn-ghost btn-sm">
              Masuk dashboard
            </Link>
            <Link to="/" className="btn btn-primary btn-sm">
              <ArrowLeft size={13} /> Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="container-x max-w-4xl py-12 sm:py-16">
        <span className="section-label">Setup database</span>
        <h1 className="mt-4 font-heading text-[clamp(2.3rem,6vw,4rem)] leading-[0.98] tracking-[-0.04em]">
          Hubungkan situs ke <em className="serif-italic">Supabase.</em>
        </h1>
        <p className="lead mt-4 max-w-2xl">
          Situs ini sudah berjalan dengan konten bawaan. Untuk mengaktifkan dashboard secara penuh,
          buat tabel di project Supabase Anda dengan menjalankan skrip berikut satu kali.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <div className="surface p-4">
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Status saat ini
            </div>
            <div className="mt-1 text-[0.82rem] font-extrabold">
              {dbStatus === "ready"
                ? "Terhubung"
                : dbStatus === "empty"
                  ? "Tabel siap, konten kosong"
                  : dbStatus === "checking"
                    ? "Memeriksa…"
                    : "Belum terhubung"}
            </div>
          </div>
          <div className="surface p-4">
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Project URL
            </div>
            <div className="mt-1 truncate font-mono text-[0.68rem]">{SUPABASE_URL}</div>
          </div>
          <div className="surface p-4">
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Tabel
            </div>
            <div className="mt-1 text-[0.82rem] font-extrabold">9 tabel + RLS</div>
          </div>
        </div>

        {dbError && (
          <div className="admin-note is-warn mt-4 text-[0.7rem]">
            <Terminal size={13} className="mr-1 inline" /> {dbError}
          </div>
        )}

        <ol className="mt-8 grid gap-3">
          {[
            "Buka Supabase Dashboard → SQL Editor.",
            "Tempel seluruh skrip di bawah (atau unduh lalu buka filenya), lalu klik Run.",
            "Kembali ke halaman ini, klik Cek koneksi untuk memastikan tabel terbaca.",
            "Buat akun admin di Supabase Dashboard → Authentication → Users → Add user. Pendaftaran publik sudah ditutup.",
            "Masuk ke dashboard, klaim akses admin, lalu buka Database & Setup dan klik Muat konten contoh.",
          ].map((step, index) => (
            <li key={step} className="flex gap-3 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] p-3.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[0.65rem] font-extrabold text-[var(--accent)]">
                {index + 1}
              </span>
              <span className="text-[0.8rem] leading-relaxed text-[var(--ink-soft)]">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="https://supabase.com/dashboard/project/irnxgpyvuugipxswbtmf/sql/new"
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-accent btn-sm"
          >
            Buka SQL Editor <ExternalLink size={13} />
          </a>
          <a
            href="https://supabase.com/dashboard/project/irnxgpyvuugipxswbtmf/auth/users"
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-ghost btn-sm"
          >
            Kelola akun admin <ExternalLink size={13} />
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void copy()}>
            {copied ? <Check size={13} /> : <Clipboard size={13} />}
            {copied ? "Tersalin" : "Salin skrip"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
            <Download size={13} /> Unduh schema.sql
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void check()}>
            {checking ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
            Cek koneksi
          </button>
          <Link to="/admin" className="btn btn-primary btn-sm">
            Ke dashboard <ArrowLeft size={13} className="rotate-180" />
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1rem] border border-[var(--line)]">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5">
            <span className="flex items-center gap-2 text-[0.65rem] font-bold">
              <ShieldCheck size={13} className="text-[var(--accent-2)]" />
              supabase/schema.sql
            </span>
            <span className="text-[0.6rem] text-[var(--muted)]">{schemaSql.split("\n").length} baris</span>
          </div>
          <pre className="max-h-[32rem] overflow-auto bg-[#041d2f] p-4 font-mono text-[0.68rem] leading-relaxed text-[#d7effa]">
            {schemaSql}
          </pre>
        </div>

        <div className="admin-note mt-6">
          <ShieldCheck size={14} className="mr-1 inline" />
          Skema memakai Row Level Security: publik hanya dapat membaca konten dan mengirim pesan.
          Hanya admin terautentikasi yang dapat menulis. Publishable key aman dipakai di browser;
          jangan pernah memakai service_role key di frontend.
        </div>

        <div className="admin-note is-warn mt-3">
          <ShieldCheck size={14} className="mr-1 inline" />
          Agar tidak ada yang bisa mendaftar, matikan <strong>Allow new users to sign up</strong> di
          Supabase → Authentication → Sign In / Providers → Email. Halaman admin hanya menampilkan
          form masuk.
        </div>
      </main>
    </div>
  );
}
