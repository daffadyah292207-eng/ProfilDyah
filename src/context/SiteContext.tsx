import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultContent, defaultProfile, defaultSettings } from "../data/defaults";
import { supabase } from "../lib/supabase";
import type {
  Certification,
  Experience,
  Profile,
  Project,
  Settings,
  SiteContent,
  Skill,
  SocialLink,
  ThemeMode,
} from "../types";

type DbStatus = "checking" | "ready" | "empty" | "missing";

interface SiteContextValue {
  content: SiteContent;
  loading: boolean;
  dbStatus: DbStatus;
  dbError: string;
  initialized: boolean;
  mode: ThemeMode;
  toggleMode: () => void;
  refresh: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table|does not exist|schema cache/i.test(error.message ?? "")
  );
}

async function fetchContent(): Promise<{
  content: SiteContent;
  initialized: boolean;
  dbStatus: DbStatus;
  dbError: string;
}> {
  const [profileRes, settingsRes, skillsRes, expRes, projectsRes, certsRes, socialsRes] =
    await Promise.all([
      supabase.from("site_profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("skills").select("*").order("sort_order", { ascending: true }),
      supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
      supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
      supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
    ]);

  const firstError =
    profileRes.error ||
    settingsRes.error ||
    skillsRes.error ||
    expRes.error ||
    projectsRes.error ||
    certsRes.error ||
    socialsRes.error;

  const missing = [
    profileRes.error,
    settingsRes.error,
    skillsRes.error,
    expRes.error,
    projectsRes.error,
    certsRes.error,
    socialsRes.error,
  ].some((error) => isMissingTable(error));

  const profileRow = (profileRes.data as Profile | null) ?? null;
  const initialized = Boolean(profileRow);

  const content: SiteContent = {
    profile: initialized
      ? { ...defaultProfile, ...profileRow, stats: profileRow?.stats ?? [], focus: profileRow?.focus ?? [] }
      : defaultProfile,
    settings: (settingsRes.data as Settings | null)
      ? { ...defaultSettings, ...(settingsRes.data as Settings) }
      : defaultSettings,
    skills: initialized
      ? ((skillsRes.data as Skill[] | null) ?? [])
      : ((skillsRes.data as Skill[] | null)?.length ? (skillsRes.data as Skill[]) : defaultContent.skills),
    experiences: initialized
      ? ((expRes.data as Experience[] | null) ?? [])
      : ((expRes.data as Experience[] | null)?.length
          ? (expRes.data as Experience[])
          : defaultContent.experiences),
    projects: initialized
      ? ((projectsRes.data as Project[] | null) ?? [])
      : ((projectsRes.data as Project[] | null)?.length
          ? (projectsRes.data as Project[])
          : defaultContent.projects),
    certifications: initialized
      ? ((certsRes.data as Certification[] | null) ?? [])
      : ((certsRes.data as Certification[] | null)?.length
          ? (certsRes.data as Certification[])
          : defaultContent.certifications),
    socials: initialized
      ? ((socialsRes.data as SocialLink[] | null) ?? [])
      : ((socialsRes.data as SocialLink[] | null)?.length
          ? (socialsRes.data as SocialLink[])
          : defaultContent.socials),
  };

  return {
    content,
    initialized,
    dbStatus: initialized ? "ready" : missing ? "missing" : "empty",
    dbError: firstError?.message ?? "",
  };
}

function accentInk(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#FFF8F2";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#14211D" : "#FFF9F3";
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DbStatus>("checking");
  const [dbError, setDbError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("dyah-theme");
    return stored === "dark" || stored === "light" ? stored : defaultSettings.theme_mode;
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchContent();
      setContent(result.content);
      setInitialized(result.initialized);
      setDbStatus(result.dbStatus);
      setDbError(result.dbError);
    } catch (error) {
      setDbStatus("missing");
      setDbError(error instanceof Error ? error.message : "Tidak dapat terhubung ke database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const settings = content.settings;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", settings.accent || "#C85834");
    root.style.setProperty("--accent-2", settings.accent_secondary || "#2F6B5A");
    root.style.setProperty("--accent-ink", accentInk(settings.accent || "#C85834"));
    root.dataset.font = settings.font_style || "editorial";
    root.dataset.grain = settings.grain ? "on" : "off";
    const stored = localStorage.getItem("dyah-theme");
    const preferred = stored === "dark" || stored === "light" ? stored : settings.theme_mode;
    setMode(preferred as ThemeMode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      preferred === "dark" ? "#0F1916" : "#F6F1E7",
    );
  }, [settings.accent, settings.accent_secondary, settings.font_style, settings.grain, settings.theme_mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", mode === "dark" ? "#0F1916" : "#F6F1E7");
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("dyah-theme", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      content,
      loading,
      dbStatus,
      dbError,
      initialized,
      mode,
      toggleMode,
      refresh,
    }),
    [content, loading, dbStatus, dbError, initialized, mode, toggleMode, refresh],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside SiteProvider");
  return context;
}
