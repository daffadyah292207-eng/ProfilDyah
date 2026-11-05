import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  Database,
  FolderKanban,
  Mail,
  Palette,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { useSite } from "../../context/SiteContext";
import { supabase, SUPABASE_URL } from "../../lib/supabase";
import { timeAgo } from "../../lib/utils";
import type { ContactMessage } from "../../types";
import type { AdminTab } from "../AdminShell";
import { Card } from "../ui";

export function Overview({
  email,
  unread,
  onNavigate,
  onUnreadChange,
}: {
  email: string;
  unread: number;
  onNavigate: (tab: AdminTab) => void;
  onUnreadChange: () => Promise<void>;
}) {
  const { content, dbStatus, initialized, dbError, refresh } = useSite();
  const [recent, setRecent] = useState<ContactMessage[]>([]);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    let active = true;
    void supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setMessageError(error.message);
          return;
        }
        setRecent((data as ContactMessage[]) ?? []);
        void onUnreadChange();
      });
    return () => {
      active = false;
    };
  }, [onUnreadChange]);

  const skills = content.skills.filter((item) => item.visible).length;
  const projects = content.projects.filter((item) => item.visible).length;
  const certifications = content.certifications.filter((item) => item.visible).length;
  const socials = content.socials.filter((item) => item.visible).length;

  const statusCopy =
    dbStatus === "ready"
      ? "Database terhubung. Konten dibaca dari Supabase."
      : dbStatus === "empty"
        ? "Tabel sudah ada, tetapi belum ada konten. Jalankan seed."
        : dbStatus === "checking"
          ? "Memeriksa koneksi database…"
          : "Tabel database belum dibuat. Jalankan skema SQL.";

  return (
    <div>
      {dbStatus !== "ready" || !initialized ? (
        <div className={`admin-note ${dbStatus === "missing" ? "is-warn" : ""} mb-4`}>
          <div className="flex flex-wrap items-center gap-2">
            <Database size={14} />
            <strong>{statusCopy}</strong>
            <button
              type="button"
              className="admin-btn admin-btn-sm ml-auto"
              onClick={() => onNavigate("setup")}
            >
              Buka setup <ArrowRight size={12} />
            </button>
          </div>
          {dbError && <div className="mt-1.5 break-all opacity-70">{dbError}</div>}
        </div>
      ) : (
        <div className="admin-note mb-4 flex flex-wrap items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
          <span>{statusCopy}</span>
          <button
            type="button"
            className="font-bold underline"
            onClick={() => void refresh()}
          >
            Cek ulang
          </button>
        </div>
      )}

      <div className="admin-grid-3">
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Keahlian</span>
            <Sparkles size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value">{skills}</div>
          <div className="st-note">tampil di situs</div>
        </div>
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Proyek</span>
            <FolderKanban size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value">{projects}</div>
          <div className="st-note">portofolio aktif</div>
        </div>
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Sertifikasi</span>
            <Award size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value">{certifications}</div>
          <div className="st-note">kredensial tercatat</div>
        </div>
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Pesan baru</span>
            <Mail size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value">{unread}</div>
          <div className="st-note">belum dibaca</div>
        </div>
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Tautan sosial</span>
            <Wrench size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value">{socials}</div>
          <div className="st-note">kanal terhubung</div>
        </div>
        <div className="stat-tile">
          <div className="flex items-center justify-between">
            <span className="st-label">Status</span>
            <Database size={14} className="text-[var(--accent)]" />
          </div>
          <div className="st-value !text-[1.05rem] !leading-tight">
            {dbStatus === "ready" ? "Online" : "Perlu setup"}
          </div>
          <div className="st-note truncate">{new URL(SUPABASE_URL).host}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card title="Ringkasan situs" description="Tampilan singkat identitas yang dilihat pengunjung.">
          <div className="flex items-center gap-3 rounded-[0.8rem] border border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line-strong)] bg-[var(--surface)]">
              {content.settings.logo_url ? (
                <img
                  src={content.settings.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : content.profile.photo_url ? (
                <img
                  src={content.profile.photo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading text-xl text-[var(--accent)]">
                  {(content.profile.full_name || "D").slice(0, 1)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate font-heading text-[1.15rem] leading-tight">
                {content.profile.full_name || "Nama belum diisi"}
              </div>
              <div className="truncate text-[0.7rem] text-[var(--muted)]">
                {content.profile.role} · {content.profile.semester}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(content.profile.focus ?? []).slice(0, 3).map((focus) => (
                  <span key={focus} className="tag">
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {[
              { tab: "profile" as AdminTab, label: "Edit profil & foto", icon: UserRound },
              { tab: "skills" as AdminTab, label: "Kelola keahlian", icon: Sparkles },
              { tab: "brand" as AdminTab, label: "Ganti logo & merek", icon: Palette },
              { tab: "appearance" as AdminTab, label: "Atur warna & tampilan", icon: Wrench },
            ].map((action) => (
              <button
                key={action.tab}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="flex items-center gap-2 rounded-[0.6rem] border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 text-left text-[0.72rem] font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <action.icon size={13} />
                {action.label}
                <ArrowRight size={12} className="ml-auto" />
              </button>
            ))}
          </div>
        </Card>

        <Card
          title="Pesan terbaru"
          description={messageError ? "Tabel pesan belum siap." : "4 pesan terakhir dari pengunjung."}
          action={
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => onNavigate("messages")}
            >
              Semua pesan
            </button>
          }
        >
          {messageError && (
            <div className="admin-hint">Aktifkan database untuk menerima pesan.</div>
          )}
          {!messageError && recent.length === 0 && (
            <div className="admin-hint">Belum ada pesan masuk.</div>
          )}
          {!messageError && recent.length > 0 && (
            <div className="grid gap-2">
              {recent.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => onNavigate("messages")}
                  className="rounded-[0.6rem] border border-[var(--line)] bg-[var(--bg)] p-2.5 text-left transition-colors hover:border-[var(--line-strong)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[0.72rem] font-bold">{message.name}</span>
                    {!message.is_read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    )}
                    <span className="ml-auto shrink-0 text-[0.58rem] text-[var(--muted)]">
                      {timeAgo(message.created_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[0.66rem] text-[var(--muted)]">
                    {message.subject || message.message}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card title="Akun admin" description="Digunakan untuk masuk ke dashboard.">
          <div className="rounded-[0.6rem] border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[0.74rem] font-semibold">
            {email}
          </div>
          <p className="admin-hint mt-2">
            Untuk menambah admin lain, gunakan Supabase Dashboard → Authentication.
          </p>
        </Card>
        <Card title="Butuh bantuan?" description="Langkah singkat menyiapkan database dan konten.">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => onNavigate("setup")}
          >
            <Database size={14} /> Buka Database & Setup
          </button>
        </Card>
      </div>
    </div>
  );
}
