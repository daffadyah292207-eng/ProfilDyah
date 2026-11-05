export type ThemeMode = "light" | "dark";
export type FontStyle = "editorial" | "modern" | "classic";

export interface StatItem {
  label: string;
  value: string;
}

export interface Profile {
  id?: number;
  full_name: string;
  nickname: string;
  role: string;
  tagline: string;
  bio: string;
  long_bio: string;
  location: string;
  email: string;
  phone: string;
  university: string;
  semester: string;
  availability: string;
  photo_url: string;
  cv_url: string;
  stats: StatItem[];
  focus: string[];
}

export interface Settings {
  id?: number;
  brand_name: string;
  logo_url: string;
  footer_note: string;
  theme_mode: ThemeMode;
  accent: string;
  accent_secondary: string;
  font_style: FontStyle;
  grain: boolean;
  hero_eyebrow: string;
  hero_title_1: string;
  hero_title_accent: string;
  hero_title_2: string;
  hero_description: string;
  cta_primary: string;
  cta_secondary: string;
  contact_heading: string;
  contact_description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
  icon: string;
  sort_order: number;
  visible: boolean;
}

export type ExperienceKind = "Pendidikan" | "Pengalaman" | "Organisasi";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
  sort_order: number;
  visible: boolean;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image_url: string;
  link: string;
  tags: string[];
  sort_order: number;
  visible: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  credential_url: string;
  sort_order: number;
  visible: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  sort_order: number;
  visible: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteContent {
  profile: Profile;
  settings: Settings;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  socials: SocialLink[];
}

export const EMPTY_SITE_CONTENT: SiteContent = {
  profile: {
    full_name: "",
    nickname: "",
    role: "",
    tagline: "",
    bio: "",
    long_bio: "",
    location: "",
    email: "",
    phone: "",
    university: "",
    semester: "",
    availability: "",
    photo_url: "",
    cv_url: "",
    stats: [],
    focus: [],
  },
  settings: {
    brand_name: "",
    logo_url: "",
    footer_note: "",
    theme_mode: "light",
    accent: "#0B6E99",
    accent_secondary: "#2C9BCB",
    font_style: "editorial",
    grain: true,
    hero_eyebrow: "",
    hero_title_1: "",
    hero_title_accent: "",
    hero_title_2: "",
    hero_description: "",
    cta_primary: "",
    cta_secondary: "",
    contact_heading: "",
    contact_description: "",
  },
  skills: [],
  experiences: [],
  projects: [],
  certifications: [],
  socials: [],
};
