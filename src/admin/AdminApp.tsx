import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, Database, Loader2, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AdminToastProvider, AdminDirtyProvider, useAdminToast } from "./AdminContext";
import { LoginView } from "./LoginView";
import { AdminShell } from "./AdminShell";

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminError, setAdminError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkAdmin = useCallback(async () => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    const { data, error } = await supabase.rpc("is_site_admin");
    if (error) {
      setAdminError(error.message);
      setIsAdmin(false);
      return;
    }
    setAdminError("");
    setIsAdmin(Boolean(data));
  }, [session]);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    let active = true;
    setIsAdmin(null);
    void checkAdmin().finally(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [session, checkAdmin]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(null);
  }

  async function handleClaim() {
    setClaiming(true);
    setClaimMessage("");
    const { error } = await supabase.rpc("claim_site_admin");
    setClaiming(false);
    if (error) {
      setClaimMessage(
        error.message.includes("Admin sudah diklaim")
          ? "Admin sudah diklaim oleh akun lain. Hubungi pemilik akun admin."
          : error.message,
      );
      return;
    }
    await checkAdmin();
  }

  if (sessionLoading) {
    return (
      <div className="admin-body grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
            Memuat sesi
          </span>
        </div>
      </div>
    );
  }

  if (!session) return <LoginView />;

  if (isAdmin === null) {
    return (
      <div className="admin-body grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
            Memeriksa akses admin
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-body grid min-h-screen place-items-center p-4">
        <div className="admin-card w-full max-w-lg">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldAlert size={20} />
          </div>
          <h1 className="h2 !text-[1.7rem]">Aktifkan akses admin</h1>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--muted)]">
            Anda sudah masuk sebagai <span className="font-semibold text-[var(--ink)]">{session.user.email}</span>
            , tetapi belum terdaftar sebagai admin. Jika ini instalasi pertama, klaim akses admin
            sekarang. Hanya akun pertama yang dapat melakukannya.
          </p>

          {adminError && (
            <div className="admin-note is-error mt-4">
              <strong>Database belum siap.</strong> {adminError}
              <div className="mt-2">
                <Link to="/setup" className="inline-flex items-center gap-1.5 font-bold underline">
                  <Database size={12} /> Buka panduan setup database
                </Link>
              </div>
            </div>
          )}

          {claimMessage && <div className="admin-note is-error mt-4">{claimMessage}</div>}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => void handleClaim()}
              disabled={claiming}
            >
              {claiming ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {claiming ? "Mengklaim…" : "Klaim sebagai admin"}
            </button>
            <button type="button" className="admin-btn" onClick={() => void handleSignOut()}>
              <LogOut size={14} /> Keluar
            </button>
            <Link to="/" className="admin-btn">
              <ArrowLeft size={14} /> Lihat situs
            </Link>
          </div>

          <p className="mt-5 border-t border-[var(--line)] pt-3 text-[0.64rem] leading-relaxed text-[var(--muted)]">
            Jika database belum dibuat, jalankan SQL di file <code>supabase/schema.sql</code> pada
            Supabase SQL Editor terlebih dahulu, lalu muat ulang halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminToastProvider>
      <AdminDirtyProvider>
        <AdminShell email={session.user.email ?? ""} onSignOut={() => void handleSignOut()} />
      </AdminDirtyProvider>
    </AdminToastProvider>
  );
}

export function AdminBootstrapHint() {
  const { notify } = useAdminToast();
  useEffect(() => {
    notify("Dashboard siap digunakan.", "info");
  }, [notify]);
  return null;
}
