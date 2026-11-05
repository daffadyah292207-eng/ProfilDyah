import { supabase } from "../lib/supabase";

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `new-${crypto.randomUUID()}`;
  }
  return `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isNewId(id: string) {
  return id.startsWith("new-");
}

function cleanForDb(item: Record<string, unknown>, includeId: boolean) {
  const { id, created_at: _createdAt, ...rest } = item;
  return includeId ? { id, ...rest } : rest;
}

export async function persistCollection<T extends { id: string }>(
  table: string,
  draft: T[],
  baseline: T[],
) {
  const removed = baseline.filter((item) => !draft.some((entry) => entry.id === item.id));
  if (removed.length > 0) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in("id", removed.map((item) => item.id));
    if (error) throw new Error(error.message);
  }

  const existing = draft.filter((item) => !isNewId(item.id));
  if (existing.length > 0) {
    const payload = existing.map((item) =>
      cleanForDb(item as unknown as Record<string, unknown>, true),
    );
    const { error } = await supabase.from(table).upsert(payload);
    if (error) throw new Error(error.message);
  }

  const added = draft.filter((item) => isNewId(item.id));
  if (added.length > 0) {
    const payload = added.map((item) =>
      cleanForDb(item as unknown as Record<string, unknown>, false),
    );
    const { error } = await supabase.from(table).insert(payload);
    if (error) throw new Error(error.message);
  }
}
