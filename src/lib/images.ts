import { supabase, SUPABASE_URL } from "./supabase";

export async function fileToDataUrl(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, atau WebP).");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 8 MB.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar tidak dapat dibuka."));
    img.src = dataUrl;
  });

  const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, width, height);

  const type = file.type === "image/png" && file.size < 350_000 ? "image/png" : "image/jpeg";
  return canvas.toDataURL(type, quality);
}

export function formatBytes(value: number) {
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function dataUrlSize(value: string) {
  const base64 = value.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

/**
 * Jika gambar lama tersimpan di Supabase Storage, hapus objeknya setelah gambar
 * baru berhasil disimpan. Gambar berupa data URL hidup di kolom teks yang sama,
 * jadi nilai lama otomatis tertimpa (terhapus) saat baris diperbarui.
 */
export async function deleteReplacedImage(oldValue: string, newValue: string) {
  if (!oldValue || oldValue === newValue || !oldValue.startsWith(SUPABASE_URL)) return;
  const marker = "/storage/v1/object/public/";
  const index = oldValue.indexOf(marker);
  if (index === -1) return;
  const [bucket, ...pathParts] = oldValue
    .slice(index + marker.length)
    .split("?")[0]
    .split("/");
  if (!bucket || pathParts.length === 0) return;
  try {
    await supabase.storage.from(bucket).remove([decodeURIComponent(pathParts.join("/"))]);
  } catch {
    // Pembersihan bersifat best-effort; penyimpanan konten tetap berhasil.
  }
}
