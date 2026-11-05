import { useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  Bone,
  Brain,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  Globe,
  Hand,
  HeartPulse,
  Instagram,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Activity,
  Bone,
  Brain,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  Hand,
  HeartPulse,
  MessageCircle,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  Users,
};

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Activity;
  return <Icon className={className} strokeWidth={1.7} />;
}

const socialIcons: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  email: Mail,
  mail: Mail,
  whatsapp: MessageCircle,
  youtube: Youtube,
  website: Globe,
};

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = socialIcons[platform.toLowerCase()] ?? ArrowUpRight;
  return <Icon className={className} strokeWidth={1.8} />;
}

export const SKILL_ICON_OPTIONS = Object.keys(icons);
export const SOCIAL_OPTIONS = [
  "linkedin",
  "instagram",
  "github",
  "email",
  "whatsapp",
  "youtube",
  "website",
];

export function useIconPreview(name: string) {
  return useMemo(() => icons[name] ?? Activity, [name]);
}
