"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard-ui";

type Message = {
  id: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};
type Result = { items: Message[]; total: number; page: number; pages: number };
const filters = [
  { label: "All messages", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function MessageManager() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), q: query });
    if (status) params.set("status", status);
    fetch(`/api/admin/messages?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Could not load messages.");
        return payload.data as Result;
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFeedback({
            text:
              error instanceof Error
                ? error.message
                : "Could not load messages.",
            error: true,
          });
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [status, query, page, reload]);

  function selectStatus(value: string) {
    setStatus(value);
    setPage(1);
    setLoading(true);
    setFeedback(null);
  }
  function search(value: string) {
    setQuery(value);
    setPage(1);
    setLoading(true);
  }

  async function moderate(
    message: Message,
    action: "APPROVED" | "REJECTED" | "DELETE",
  ) {
    if (
      action === "DELETE" &&
      !window.confirm("Delete this message permanently?")
    )
      return;
    setBusyId(message.id);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: action === "DELETE" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(action !== "DELETE"
          ? { body: JSON.stringify({ status: action }) }
          : {}),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Could not update the message.");
      setFeedback({
        text:
          action === "DELETE"
            ? "Message deleted."
            : action === "APPROVED"
              ? "Message approved."
              : "Message rejected.",
        error: false,
      });
      setReload((value) => value + 1);
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Could not update the message.",
        error: true,
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="content-stack">
      <div className="inbox-toolbar">
        <div className="tab-list" role="group" aria-label="Message status">
          {filters.map((filter) => (
            <button
              className={status === filter.value ? "active" : ""}
              aria-pressed={status === filter.value}
              key={filter.value}
              type="button"
              onClick={() => selectStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            type="search"
            aria-label="Search messages"
            placeholder="Search messages..."
            value={query}
            onChange={(event) => search(event.target.value)}
          />
        </label>
      </div>
      {feedback && (
        <div
          className={`notice ${feedback.error ? "notice-error" : "notice-success"}`}
          role="status"
        >
          {feedback.error ? <X size={16} /> : <Check size={16} />}{" "}
          {feedback.text}
        </div>
      )}
      <section className="surface-card inbox-panel">
        <div className="inbox-heading">
          <div>
            <span className="inbox-heading-icon">
              <Inbox size={20} />
            </span>
            <strong>
              {status
                ? filters.find((filter) => filter.value === status)?.label
                : "All messages"}
            </strong>
            <span className="count-pill">{result?.total ?? "—"}</span>
          </div>
          <span className="muted">Newest first</span>
        </div>
        {loading ? (
          <div className="message-skeleton" aria-label="Loading messages">
            <div />
            <div />
            <div />
          </div>
        ) : result?.items.length ? (
          <div className="inbox-list">
            {result.items.map((message) => (
              <article className="inbox-item" key={message.id}>
                <div className="inbox-item-icon">
                  <MailGlyph status={message.status} />
                </div>
                <div className="inbox-item-body">
                  <div className="inbox-item-meta">
                    <span
                      className={`status-pill ${message.status.toLowerCase()}`}
                    >
                      {message.status.toLowerCase()}
                    </span>
                    <time dateTime={message.createdAt}>
                      {new Date(message.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                  <p>{message.content}</p>
                  <div className="inbox-item-actions">
                    {message.status !== "APPROVED" && (
                      <button
                        className="button button-small button-secondary"
                        type="button"
                        disabled={busyId === message.id}
                        onClick={() => moderate(message, "APPROVED")}
                      >
                        <Check size={14} /> Approve
                      </button>
                    )}
                    {message.status !== "REJECTED" && (
                      <button
                        className="button button-small button-secondary"
                        type="button"
                        disabled={busyId === message.id}
                        onClick={() => moderate(message, "REJECTED")}
                      >
                        <X size={14} /> Reject
                      </button>
                    )}
                    <button
                      className="button button-small button-quiet danger-text"
                      type="button"
                      disabled={busyId === message.id}
                      onClick={() => moderate(message, "DELETE")}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing in this view"
            description={
              query
                ? "Try a different search term or filter."
                : status === "PENDING"
                  ? "New notes will appear here for review."
                  : "Visitor messages will appear here after they arrive."
            }
            icon={<Inbox size={25} strokeWidth={1.5} />}
          />
        )}
      </section>
      {(result?.pages || 0) > 1 && (
        <div className="pagination">
          <span>
            Page {page} of {result?.pages}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((value) => value - 1);
                setLoading(true);
              }}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Next page"
              type="button"
              disabled={page >= (result?.pages || 1)}
              onClick={() => {
                setPage((value) => value + 1);
                setLoading(true);
              }}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MailGlyph({ status }: { status: Message["status"] }) {
  return status === "APPROVED" ? (
    <CheckCheck size={20} />
  ) : status === "REJECTED" ? (
    <X size={20} />
  ) : (
    <Inbox size={20} />
  );
}
