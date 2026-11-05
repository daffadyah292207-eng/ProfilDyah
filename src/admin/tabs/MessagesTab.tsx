import { useCallback, useEffect, useState } from "react";
import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  Reply,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatDate, timeAgo } from "../../lib/utils";
import { Card } from "../ui";
import type { ContactMessage } from "../../types";

export function MessagesTab({ onUnreadChange }: { onUnreadChange: () => Promise<void> }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setMessages((data as ContactMessage[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleRead(message: ContactMessage) {
    const { error: updateError } = await supabase
      .from("messages")
      .update({ is_read: !message.is_read })
      .eq("id", message.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessages((current) =>
      current.map((item) => (item.id === message.id ? { ...item, is_read: !item.is_read } : item)),
    );
    await onUnreadChange();
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus pesan ini secara permanen?")) return;
    const { error: deleteError } = await supabase.from("messages").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setMessages((current) => current.filter((item) => item.id !== id));
    await onUnreadChange();
  }

  const unread = messages.filter((item) => !item.is_read).length;
  const filtered = filter === "unread" ? messages.filter((item) => !item.is_read) : messages;

  return (
    <div>
      {error && (
        <div className="admin-note is-error mb-4">
          {error}
          <div className="mt-1.5">
            <Link to="/setup" className="font-bold underline">
              Periksa panduan database
            </Link>
          </div>
        </div>
      )}

      <Card
        title={`Pesan masuk (${messages.length})`}
        description={`${unread} pesan belum dibaca. Pesan dikirim dari formulir kontak.`}
        action={
          <div className="admin-toolbar">
            <div className="admin-tabs">
              <button
                type="button"
                className={`admin-tab ${filter === "all" ? "is-active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Semua
              </button>
              <button
                type="button"
                className={`admin-tab ${filter === "unread" ? "is-active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Belum dibaca {unread > 0 ? `(${unread})` : ""}
              </button>
            </div>
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => void load()}
              title="Muat ulang pesan"
              aria-label="Muat ulang pesan"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        }
      >
        {loading && (
          <div className="flex items-center gap-2 py-8 text-[0.75rem] text-[var(--muted)]">
            <Loader2 size={15} className="animate-spin" /> Memuat pesan…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
              {filter === "unread" ? <CheckCheck size={19} /> : <Inbox size={19} />}
            </span>
            <p className="text-[0.8rem] font-bold">
              {filter === "unread" ? "Semua pesan sudah dibaca" : "Belum ada pesan"}
            </p>
            <p className="max-w-xs text-[0.68rem] leading-relaxed text-[var(--muted)]">
              Pesan dari formulir kontak akan muncul di sini.
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-2">
            {filtered.map((message) => {
              const isOpen = expanded === message.id;
              return (
                <article
                  key={message.id}
                  className={`rounded-[0.8rem] border bg-[var(--bg)] transition-colors ${
                    message.is_read ? "border-[var(--line)]" : "border-[var(--accent)]/35"
                  }`}
                >
                  <div className="flex items-start gap-3 p-3.5">
                    <span
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        message.is_read
                          ? "bg-[var(--surface-2)] text-[var(--muted)]"
                          : "bg-[var(--accent-soft)] text-[var(--accent)]"
                      }`}
                    >
                      {message.is_read ? <MailOpen size={14} /> : <Mail size={14} />}
                    </span>

                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setExpanded(isOpen ? null : message.id)}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[0.78rem] font-extrabold">{message.name}</span>
                        {!message.is_read && (
                          <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[0.5rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent-ink)]">
                            Baru
                          </span>
                        )}
                        <span className="text-[0.62rem] text-[var(--muted)]">
                          {timeAgo(message.created_at)}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[0.72rem] font-semibold text-[var(--ink-soft)]">
                        {message.subject || "(Tanpa subjek)"}
                      </div>
                      {!isOpen && (
                        <p className="mt-1 line-clamp-1 text-[0.68rem] text-[var(--muted)]">
                          {message.message}
                        </p>
                      )}
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => void toggleRead(message)}
                        title={message.is_read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                        aria-label={message.is_read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                      >
                        {message.is_read ? <Mail size={12} /> : <CheckCheck size={12} />}
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        onClick={() => void remove(message.id)}
                        aria-label="Hapus pesan"
                        title="Hapus pesan"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => setExpanded(isOpen ? null : message.id)}
                        aria-label={isOpen ? "Tutup pesan" : "Baca pesan"}
                      >
                        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-[var(--line)] px-3.5 pb-3.5 pt-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.64rem] text-[var(--muted)]">
                        <a href={`mailto:${message.email}`} className="font-semibold text-[var(--accent)]">
                          {message.email}
                        </a>
                        <span>·</span>
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-[0.78rem] leading-relaxed text-[var(--ink-soft)]">
                        {message.message}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <a
                          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "Pesan dari website")}`}
                          className="admin-btn admin-btn-sm admin-btn-primary"
                        >
                          <Reply size={12} /> Balas lewat email
                        </a>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => void toggleRead(message)}
                        >
                          {message.is_read ? <Mail size={12} /> : <CheckCheck size={12} />}
                          {message.is_read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
