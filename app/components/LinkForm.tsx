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
  const [code, setCode] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<"redirect" | "proxy">("redirect");
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
        body: JSON.stringify({ name, code, destination, mode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      const link: CreatedLink = await res.json();
      setName("");
      setCode("");
      setDestination("");
      setMode("redirect");
      onCreated(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mashreq online banking"
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
          Custom short code{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="mashriq — blank = random"
            className={`${inputClass} font-mono`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Destination URL
        <input
          type="url"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://digital.mashreq.com/onlinebanking/"
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <fieldset className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          <span>When scanned</span>
          <div className="flex gap-4 font-normal">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                checked={mode === "redirect"}
                onChange={() => setMode("redirect")}
              />
              Open the link (website)
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                checked={mode === "proxy"}
                onChange={() => setMode("proxy")}
              />
              Serve the file (PDF, image…)
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create QR link"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
