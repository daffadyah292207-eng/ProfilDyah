# Dyah — Website Profil Fisioterapi

Website portofolio untuk mahasiswa Fisioterapi, lengkap dengan dashboard admin untuk mengubah
profil, keahlian (ala LinkedIn), pengalaman, proyek, sertifikasi, tautan sosial, logo, warna,
tipografi, dan konten hero. Data disimpan di **Supabase Postgres** dan situs dapat di-deploy ke
GitHub Pages.

![Tech](https://img.shields.io/badge/React-19-149ECA) ![Vite](https://img.shields.io/badge/Vite-6-646CFF) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)

## Fitur

- Desain editorial modern: hero besar, ilustrasi anatomi SVG, animasi halus, grain, mode
  terang/gelap, dan responsif penuh.
- Bagian: Tentang, Keahlian, Perjalanan (pendidikan/pengalaman/organisasi), Proyek, Sertifikasi,
  Kontak, dan footer.
- Dashboard `/admin`:
  - Login saja via Supabase Auth (pendaftaran akun ditutup).
  - Klaim admin otomatis untuk akun pertama.
  - Edit profil, foto, CV, statistik, dan fokus.
  - CRUD keahlian dengan level, kategori, ikon, dan urutan.
  - CRUD pengalaman, proyek, sertifikasi, dan tautan sosial.
  - Ganti logo dan nama brand.
  - Atur mode, palet warna, pasangan font, dan tekstur grain.
  - Edit judul hero dan CTA.
  - Kotak masuk pesan kontak (baca, tandai, balas, hapus).
  - Setup database dan seed konten contoh langsung dari dashboard.
- Formulir kontak menyimpan pesan ke tabel `messages`.
- RLS Supabase: publik hanya bisa membaca konten dan mengirim pesan; hanya admin yang bisa menulis.
- Gambar diunggah sebagai data URL terkompresi (tanpa perlu Supabase Storage). Foto baru hanya
  ditulis ke database setelah **Simpan perubahan** ditekan; nilai lama otomatis tertimpa. Jika
  suatu saat memakai Supabase Storage, objek lama ikut dihapus setelah penyimpanan berhasil.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Build produksi:

```bash
npm run build
npm run preview
```

Konfigurasi Supabase ada di `.env` (opsional, karena nilai publik sudah menjadi fallback):

```env
VITE_SUPABASE_URL=https://irnxgpyvuugipxswbtmf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_74EIfTsiQ1BKGXRWTTtGvA_WlQ0ZEPW
```

> Publishable/anon key aman dipakai di browser. Jangan pernah menaruh **service_role** key di
> frontend.

## Setup database Supabase (sekali saja)

Karena publishable key tidak dapat menjalankan DDL, skema harus dijalankan dari SQL Editor:

1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/irnxgpyvuugipxswbtmf/sql/new).
2. Salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql), tempel, lalu **Run**.
3. Buka `/setup` di aplikasi untuk memandu langkah ini (ada tombol salin/unduh).
4. Buat akun admin dari **Supabase → Authentication → Users → Add user**. Pendaftaran publik
   ditutup, jadi halaman `/admin` hanya menampilkan form masuk.
5. Masuk ke `/admin`, klik **Klaim sebagai admin**, lalu di **Database & Setup** klik
   **Muat konten contoh**.

Skema membuat 9 tabel (`site_profile`, `site_settings`, `skills`, `experiences`, `projects`,
`certifications`, `social_links`, `messages`, `site_admins`), RLS, trigger `updated_at`, dan fungsi
`is_site_admin()` + `claim_site_admin()`.

### Akun admin & pendaftaran

Halaman admin tidak menyediakan pendaftaran. Buat akun dari
**Supabase → Authentication → Users → Add user**, lalu masuk lewat `/admin`.

Matikan **Authentication → Sign In / Providers → Email → Allow new users to sign up** agar tidak
ada yang bisa mendaftar lewat API. Jika konfirmasi email masih aktif, konfirmasi akun terlebih
dahulu atau nonaktifkan **Confirm email** saat membuat akun pertama.

## Deploy ke GitHub Pages

Workflow `.github/workflows/deploy.yml` sudah disiapkan:

1. Push ke branch `main`.
2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Jalankan workflow (otomatis saat push). Situs akan tersedia di
   `https://daffadyah292207-eng.github.io/ProfilDyah/`.

Workflow memakai `VITE_BASE=/ProfilDyah/` agar aset dan routing cocok dengan subpath repo.
`public/404.html` menangani deep link seperti `/admin` pada GitHub Pages.

## Deploy ke Vercel

Repo sudah menyertakan `vercel.json` dengan rewrite SPA, sehingga `/admin` dan `/setup` dapat
dibuka langsung tanpa 404. Import repo di Vercel; framework terdeteksi sebagai Vite, build
`npm run build`, output `dist`. Tidak perlu mengatur `VITE_BASE` (default `/`).

## Struktur

```
src/
  admin/            Dashboard, login, tab editor, komponen UI admin
  components/       Logo, ikon, ilustrasi, reveal animation
  components/public Navbar, Hero, About, Skills, Timeline, Projects, dll.
  context/          SiteContext (fetch + theme)
  data/             Konten contoh bawaan
  lib/              Supabase client, util, kompresi gambar
  pages/            Home, SetupPage
supabase/schema.sql Skema database + RLS
public/404.html     SPA fallback GitHub Pages
```

## Catatan keamanan

- RLS aktif di semua tabel.
- `site_admins` hanya dapat dibaca oleh admin terkait.
- Fungsi `claim_site_admin()` hanya berfungsi saat belum ada admin sama sekali.
- Pesan kontak dapat dibaca/diubah/dihapus hanya oleh admin.
- Untuk menambah admin lain, buat akun dari Supabase Authentication lalu insert barisnya melalui
  SQL Editor:

```sql
insert into public.site_admins (user_id, email)
select id, email from auth.users where email = 'admin-baru@email.com';
```

## Lisensi

Konten dan identitas milik pemilik situs. Kode boleh digunakan kembali untuk keperluan portofolio.
