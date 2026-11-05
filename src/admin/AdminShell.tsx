import { useCallback, useEffect, useState } from "react";
import {
  Award,
  Database,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Paintbrush,
  Palette,
  Route,
  Share2,
  Sparkles,
  Sun,
  Type,
  UserRound,
  X,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { supabase } from "../lib/supabase";
import { Logo } from "../components/Logo";
import { Overview } from "./tabs/Overview";
import { ProfileTab } from "./tabs/ProfileTab";
import { BrandTab } from "./tabs/BrandTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { HeroTab } from "./tabs/HeroTab";
import { SkillsTab } from "./tabs/SkillsTab";
import { ExperienceTab } from "./tabs/ExperienceTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { CertificationsTab } from "./tabs/CertificationsTab";
import { SocialTab } from "./tabs/SocialTab";
import { MessagesTab } from "./tabs/MessagesTab";
import { SetupTab } from "./tabs/SetupTab";
import { cn } from "../lib/utils";

export type AdminTab =
  | "overview"
  | "profile"
  | "skills"
  | "experiences"
  | "projects"
  | "certifications"
  | "socials"
  | "brand"
  | "appearance"
  | "hero"
  | "messages"
  | "setup";

const groups: {
  label: string;
  items: { key: AdminTab; label: string; icon: typeof LayoutDashboard; badge?: boolean }[];
}[] = [
  {
    label: "Konten",
    items: [
      { key: "overview", label: "Ikhtisar", icon: LayoutDashboard },
      { key: "profile", label: "Profil", icon: UserRound },
      { key: "skills", label: "Keahlian", icon: Sparkles },
      { key: "experiences", label: "Pengalaman", icon: Route },
      { key: "projects", label: "Proyek", icon: FolderKanban },
      { key: "certifications", label: "Sertifikasi", icon: Award },
      { key: "socials", label: "Tautan Sosial", icon: Share2 },
    ],
  },
  {
    label: "Tampilan",
    items: [
      { key: "brand", label: "Merek & Logo", icon: Palette },
      { key: "appearance", label: "Tampilan", icon: Paintbrush },
      { key: "hero", label: "Hero & CTA", icon: Type },
    ],
  },
  {
    label: "Komunikasi",
    items: [{ key: "messages", label: "Pesan Masuk", icon: Mail, badge: true }],
  },
  {
    label: "Sistem",
    items: [{ key: "setup", label: "Database & Setup", icon: Database }],
  },
];

const titles: Record<AdminTab, { title: string; sub: string }> = {
  overview: { title: "Ikhtisar", sub: "Ringkasan situs dan aktivitas terbaru." },
  profile: { title: "Profil", sub: "Identitas, bio, foto, statistik, dan fokus." },
  skills: { title: "Keahlian", sub: "Kelola keterampilan ala LinkedIn beserta levelnya." },
  experiences: { title: "Pengalaman", sub: "Pendidikan, pengalaman, dan organisasi." },
  projects: { title: "Proyek", sub: "Portofolio, studi kasus, dan program." },
  certifications: { title: "Sertifikasi", sub: "Pelatihan dan kredensial profesional." },
  socials: { title: "Tautan Sosial", sub: "LinkedIn, Instagram, email, dan lainnya." },
  brand: { title: "Merek & Logo", sub: "Nama brand, logo, dan catatan footer." },
  appearance: { title: "Tampilan", sub: "Warna, mode, tipografi, dan tekstur." },
  hero: { title: "Hero & CTA", sub: "Judul utama, deskripsi, dan tombol ajakan." },
  messages: { title: "Pesan Masuk", sub: "Pesan dari formulir kontak pengunjung." },
  setup: { title: "Database & Setup", sub: "Status Supabase, skema SQL, dan seed konten." },
};

export function AdminShell({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const { content, mode, toggleMode, refresh } = useSite();
  const [active, setActive] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    setUnread(count ?? 0);
  }, []);

  useEffect(() => {
    void loadUnread();
  }, [loadUnread]);

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const meta = titles[active];

  function navigate(tab: AdminTab) {
    setActive(tab);
  }

  return (
    <div className="admin-shell admin-body">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-10 bg-black/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn("admin-sidebar", sidebarOpen && "is-open")}>
        <div className="admin-brand">
          <Logo
            brand={content.settings.brand_name || "Dyah."}
            logoUrl={content.settings.logo_url}
            size="sm"
          />
          <span className="ml-auto rounded-full border border-[var(--line)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
            Admin
          </span>
        </div>

        <nav className="admin-nav" aria-label="Menu dashboard">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="admin-nav-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.key)}
                  className={cn("admin-link", active === item.key && "is-active")}
                >
                  <item.icon size={15} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {item.badge && unread > 0 && <span className="badge">{unread}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="px-1.5 pb-1 text-[0.6rem] leading-relaxed text-[var(--muted)]">
            Masuk sebagai
            <div className="truncate text-[0.68rem] font-semibold text-[var(--ink)]">{email}</div>
          </div>
          <Link to="/" className="admin-link">
            <ExternalLink size={14} /> Lihat situs
          </Link>
          <button type="button" className="admin-link" onClick={onSignOut}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="admin-icon-btn admin-mobile-bar"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu dashboard"
            >
              <Menu size={17} />
            </button>
            <div>
              <h1 className="admin-title">{meta.title}</h1>
              <p className="admin-sub">{meta.sub}</p>
            </div>
          </div>
          <div className="admin-toolbar">
            <button
              type="button"
              className="admin-icon-btn"
              onClick={toggleMode}
              aria-label={mode === "dark" ? "Mode terang" : "Mode gelap"}
              title={mode === "dark" ? "Mode terang" : "Mode gelap"}
            >
              {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => void refresh()}
              title="Muat ulang data dari database"
            >
              Muat ulang
            </button>
            <Link to="/" className="admin-btn admin-btn-sm admin-btn-primary">
              <ExternalLink size={13} /> Lihat situs
            </Link>
          </div>
        </div>

        {active === "overview" && (
          <Overview
            email={email}
            unread={unread}
            onNavigate={navigate}
            onUnreadChange={loadUnread}
          />
        )}
        {active === "profile" && <ProfileTab />}
        {active === "skills" && <SkillsTab />}
        {active === "experiences" && <ExperienceTab />}
        {active === "projects" && <ProjectsTab />}
        {active === "certifications" && <CertificationsTab />}
        {active === "socials" && <SocialTab />}
        {active === "brand" && <BrandTab />}
        {active === "appearance" && <AppearanceTab />}
        {active === "hero" && <HeroTab />}
        {active === "messages" && <MessagesTab onUnreadChange={loadUnread} />}
        {active === "setup" && <SetupTab />}
      </main>

      <button
        type="button"
        className="fixed bottom-4 left-4 z-20 admin-icon-btn lg:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-label="Tutup menu"
        hidden={!sidebarOpen}
      >
        <X size={16} />
      </button>
    </div>
  );
}
