"use client";

import { useState } from "react";
import type { LinkRow } from "@/lib/db";

export type CreatedLink = LinkRow & { qrUrl: string };

export default function LinkForm({
  onCreated,
}: {
  onCreated: (link: CreatedLink) => void;
}) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, destination }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      const link: CreatedLink = await res.json();
      setName("");
      setDestination("");
      onCreated(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Menu — front window"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-500"
        />
      </label>
      <label className="flex flex-[2] flex-col gap-1 text-sm font-medium text-zinc-700">
        Destination URL
        <input
          type="url"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://example.com/menu.pdf"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-500"
        />
      </label>
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create QR link"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 sm:self-center">{error}</p>
      )}
    </form>
  );
}
