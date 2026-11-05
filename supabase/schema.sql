-- ============================================================================
--  ProfilDyah — skema database Supabase
--  Jalankan seluruh file ini di Supabase Dashboard → SQL Editor → Run.
--  Aman dijalankan ulang (idempotent).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
--  Tabel konten
-- ---------------------------------------------------------------------------
create table if not exists public.site_profile (
  id             smallint primary key default 1 check (id = 1),
  full_name      text not null default '',
  nickname       text not null default '',
  role           text not null default '',
  tagline        text not null default '',
  bio            text not null default '',
  long_bio       text not null default '',
  location       text not null default '',
  email          text not null default '',
  phone          text not null default '',
  university     text not null default '',
  semester       text not null default '',
  availability   text not null default '',
  photo_url      text not null default '',
  cv_url         text not null default '',
  stats          jsonb not null default '[]'::jsonb,
  focus          text[] not null default '{}',
  updated_at     timestamptz not null default now()
);

create table if not exists public.site_settings (
  id                  smallint primary key default 1 check (id = 1),
  brand_name          text not null default 'Dyah.',
  logo_url            text not null default '',
  footer_note         text not null default '',
  theme_mode          text not null default 'light' check (theme_mode in ('light', 'dark')),
  accent              text not null default '#C85834',
  accent_secondary    text not null default '#2F6B5A',
  font_style          text not null default 'editorial' check (font_style in ('editorial', 'modern', 'classic')),
  grain               boolean not null default true,
  hero_eyebrow        text not null default '',
  hero_title_1        text not null default '',
  hero_title_accent   text not null default '',
  hero_title_2        text not null default '',
  hero_description    text not null default '',
  cta_primary         text not null default '',
  cta_secondary       text not null default '',
  contact_heading     text not null default '',
  contact_description text not null default '',
  updated_at          timestamptz not null default now()
);

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',
  category    text not null default 'Klinis',
  level       integer not null default 60 check (level between 0 and 100),
  description text not null default '',
  icon        text not null default 'Activity',
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.experiences (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'Pengalaman' check (kind in ('Pendidikan', 'Pengalaman', 'Organisasi')),
  title        text not null default '',
  organization text not null default '',
  location     text not null default '',
  period       text not null default '',
  description  text not null default '',
  highlights   text[] not null default '{}',
  sort_order   integer not null default 0,
  visible      boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  category    text not null default '',
  year        text not null default '',
  description text not null default '',
  image_url   text not null default '',
  link        text not null default '',
  tags        text[] not null default '{}',
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.certifications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null default '',
  issuer         text not null default '',
  year           text not null default '',
  credential_url text not null default '',
  sort_order     integer not null default 0,
  visible        boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null default 'website',
  label      text not null default '',
  url        text not null default '',
  sort_order integer not null default 0,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null default '',
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Daftar admin. User pertama yang memanggil claim_site_admin() akan terdaftar.
create table if not exists public.site_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Updated-at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_profile_touch on public.site_profile;
create trigger site_profile_touch
  before update on public.site_profile
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
--  Admin helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_site_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.site_admins where user_id = auth.uid()
  );
$$;

grant execute on function public.is_site_admin() to anon, authenticated;

-- Hanya bisa dipakai saat belum ada admin sama sekali (bootstrap).
create or replace function public.claim_site_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count integer;
begin
  if auth.uid() is null then
    raise exception 'Anda harus login terlebih dahulu.';
  end if;

  select count(*) into admin_count from public.site_admins;
  if admin_count > 0 then
    raise exception 'Admin sudah diklaim. Hubungi admin yang ada.';
  end if;

  insert into public.site_admins (user_id, email)
  values (auth.uid(), coalesce(auth.jwt() ->> 'email', ''))
  on conflict (user_id) do nothing;

  return true;
end;
$$;

grant execute on function public.claim_site_admin() to authenticated;

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------
alter table public.site_profile    enable row level security;
alter table public.site_settings   enable row level security;
alter table public.skills          enable row level security;
alter table public.experiences     enable row level security;
alter table public.projects        enable row level security;
alter table public.certifications  enable row level security;
alter table public.social_links    enable row level security;
alter table public.messages        enable row level security;
alter table public.site_admins     enable row level security;

-- Semua konten boleh dibaca publik (halaman profil).
drop policy if exists "profile_public_read" on public.site_profile;
create policy "profile_public_read" on public.site_profile
  for select using (true);

drop policy if exists "profile_admin_write" on public.site_profile;
create policy "profile_admin_write" on public.site_profile
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read" on public.skills
  for select using (true);

drop policy if exists "skills_admin_write" on public.skills;
create policy "skills_admin_write" on public.skills
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read" on public.experiences
  for select using (true);

drop policy if exists "experiences_admin_write" on public.experiences;
create policy "experiences_admin_write" on public.experiences
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (true);

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "certifications_public_read" on public.certifications;
create policy "certifications_public_read" on public.certifications
  for select using (true);

drop policy if exists "certifications_admin_write" on public.certifications;
create policy "certifications_admin_write" on public.certifications
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "social_links_public_read" on public.social_links;
create policy "social_links_public_read" on public.social_links
  for select using (true);

drop policy if exists "social_links_admin_write" on public.social_links;
create policy "social_links_admin_write" on public.social_links
  for all to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

-- Pesan: siapa pun boleh mengirim, hanya admin yang boleh membaca/mengelola.
drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert" on public.messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists "messages_admin_read" on public.messages;
create policy "messages_admin_read" on public.messages
  for select to authenticated
  using (public.is_site_admin());

drop policy if exists "messages_admin_update" on public.messages;
create policy "messages_admin_update" on public.messages
  for update to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "messages_admin_delete" on public.messages;
create policy "messages_admin_delete" on public.messages
  for delete to authenticated
  using (public.is_site_admin());

-- Daftar admin: user hanya bisa melihat barisnya sendiri; admin bisa melihat semua.
drop policy if exists "admins_read" on public.site_admins;
create policy "admins_read" on public.site_admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_site_admin());

-- ---------------------------------------------------------------------------
--  Hak akses tabel
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.site_profile, public.site_settings, public.skills,
  public.experiences, public.projects, public.certifications, public.social_links
  to anon, authenticated;

grant insert, update, delete on public.site_profile, public.site_settings,
  public.skills, public.experiences, public.projects, public.certifications,
  public.social_links, public.messages
  to authenticated;

grant insert on public.messages to anon;
grant select on public.site_admins to authenticated;
grant insert on public.site_admins to authenticated;

-- ---------------------------------------------------------------------------
--  Index
-- ---------------------------------------------------------------------------
create index if not exists skills_sort_idx on public.skills (sort_order);
create index if not exists experiences_sort_idx on public.experiences (sort_order);
create index if not exists projects_sort_idx on public.projects (sort_order);
create index if not exists certifications_sort_idx on public.certifications (sort_order);
create index if not exists social_links_sort_idx on public.social_links (sort_order);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_unread_idx on public.messages (is_read) where is_read = false;
