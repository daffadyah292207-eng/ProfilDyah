import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useSite } from "../context/SiteContext";
import { Logo } from "../components/Logo";

type Mode = "login" | "reset";

export function LoginView() {
  const { content } = useSite();
  const { settings } = content;
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "reset") {
        const redirect = `${window.location.origin}${import.meta.env.BASE_URL}admin`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirect,
        });
        if (resetError) throw resetError;
        setMessage("Tautan reset password sudah dikirim. Periksa email Anda.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="flex items-center justify-between gap-4">
          <Logo brand={settings.brand_name || "Dyah."} logoUrl={settings.logo_url} />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={13} /> Lihat situs
          </Link>
        </div>

        <div className="relative my-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/70">
            <ShieldCheck size={12} /> Ruang admin
          </div>
          <h1 className="la-title">
            Ruang kerja untuk
            <br />
            cerita yang terus <em>bertumbuh.</em>
          </h1>
          <p className="mt-5 max-w-md text-[0.82rem] leading-relaxed text-white/60">
            Kelola profil, keahlian, pengalaman, proyek, hingga tampilan situs dari satu tempat.
            Perubahan langsung terlihat oleh pengunjung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[0.62rem] uppercase tracking-[0.12em] text-white/40">
          <span>Profil</span>
          <span>·</span>
          <span>Keahlian</span>
          <span>·</span>
          <span>Tampilan</span>
          <span>·</span>
          <span>Pesan</span>
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-box">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              <LockKeyhole size={11} /> Akses terbatas
            </div>
            <h2 className="h2 !text-[2rem]">
              {mode === "reset" ? "Atur ulang password" : "Selamat datang kembali"}
            </h2>
            <p className="mt-2 text-[0.76rem] leading-relaxed text-[var(--muted)]">
              {mode === "reset"
                ? "Masukkan email akun admin untuk menerima tautan reset password."
                : "Masuk untuk mengelola isi dan tampilan website profil."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="admin-field">
              <span className="admin-label">Email</span>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  className="admin-input !py-2.5 !pl-9"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
            </label>

            {mode !== "reset" && (
              <label className="admin-field">
                <span className="admin-label">Password</span>
                <div className="relative">
                  <LockKeyhole size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="admin-input !py-2.5 !pl-9"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </label>
            )}

            {error && <div className="admin-note is-error">{error}</div>}
            {message && <div className="admin-note">{message}</div>}

            <button type="submit" className="btn btn-primary mt-1 w-full" disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : null}
              {mode === "reset" ? "Kirim tautan" : "Masuk ke dashboard"}
              {!busy && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[0.68rem]">
            {mode === "login" ? (
              <button
                type="button"
                className="font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => switchMode("reset")}
              >
                Lupa password?
              </button>
            ) : (
              <button
                type="button"
                className="font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => switchMode("login")}
              >
                Kembali ke halaman masuk
              </button>
            )}
            <Link to="/setup" className="font-semibold text-[var(--muted)] hover:text-[var(--accent)]">
              Panduan database
            </Link>
          </div>

          <div className="mt-5 rounded-[0.8rem] border border-[var(--line)] bg-[var(--surface-2)] p-3.5 text-[0.65rem] leading-relaxed text-[var(--muted)]">
            <strong className="text-[var(--ink)]">Pendaftaran akun ditutup.</strong> Hanya akun admin
            yang dapat masuk. Untuk membuat akun admin pertama, buat pengguna melalui Supabase
            Dashboard → Authentication → Users.
            <a
              href="https://supabase.com/dashboard/project/irnxgpyvuugipxswbtmf/auth/users"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 flex w-fit items-center gap-1 font-bold text-[var(--accent)]"
            >
              Buka pengguna Supabase <ExternalLink size={11} />
            </a>
          </div>

          <p className="mt-4 border-t border-[var(--line)] pt-4 text-[0.62rem] leading-relaxed text-[var(--muted)]">
            Dashboard ini menggunakan Supabase Auth. Hanya akun yang terdaftar sebagai admin yang
            dapat mengubah konten.
          </p>
        </div>
      </div>
    </div>
  );
}
