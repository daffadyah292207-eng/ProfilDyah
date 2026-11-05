import { Link } from "react-router-dom";
import { initials } from "../lib/utils";

export function Logo({
  brand,
  logoUrl,
  size = "md",
  to = "/",
}: {
  brand: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  to?: string;
}) {
  const markSize = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-lg";
  const nameSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <Link to={to} className="flex items-center gap-2.5 group" aria-label={`${brand} — beranda`}>
      <span
        className={`${markSize} grid place-items-center rounded-full overflow-hidden border border-[var(--line-strong)] bg-[var(--surface)] transition-transform duration-300 group-hover:-rotate-6`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-heading tracking-tight text-[var(--accent)]">
            {initials(brand.replace(/\.$/, ""))}
          </span>
        )}
      </span>
      <span className={`${nameSize} font-heading tracking-[-0.03em] leading-none`}>
        {brand}
      </span>
    </Link>
  );
}
