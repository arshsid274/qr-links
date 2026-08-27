"use client";

import { useState } from "react";
import type { LinkRow } from "@/lib/db";
import { downloadQrPng } from "./QRDisplay";

function shortUrl(code: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/r/${code}`;
}

function DestinationCell({
  link,
  onSaved,
}: {
  link: LinkRow;
  onSaved: (updated: LinkRow) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(link.destination);
  const [saving, setSaving] = useState(false);

  async function save() {
    const next = value.trim();
    if (next === link.destination) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/links/${link.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Failed to update destination");
        setValue(link.destination);
      } else {
        onSaved(await res.json());
      }
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        title="Click to edit"
        onClick={() => {
          setValue(link.destination);
          setEditing(true);
        }}
        className="max-w-xs truncate text-left text-zinc-600 underline decoration-dotted underline-offset-2 hover:text-zinc-900"
      >
        {link.destination}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="url"
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setValue(link.destination);
          setEditing(false);
        }
      }}
      className="w-full min-w-56 rounded-md border border-zinc-400 px-2 py-1 text-sm outline-none"
    />
  );
}

export default function LinkTable({
  links,
  onUpdated,
  onDeleted,
}: {
  links: LinkRow[];
  onUpdated: (link: LinkRow) => void;
  onDeleted: (code: string) => void;
}) {
  async function handleDelete(link: LinkRow) {
    const label = link.name || link.code;
    if (!confirm(`Delete "${label}"? Its QR code will stop working.`)) return;
    const res = await fetch(`/api/links/${link.code}`, { method: "DELETE" });
    if (res.ok) onDeleted(link.code);
    else alert("Failed to delete link");
  }

  if (links.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        No links yet — create one above and its QR code will appear here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Short URL</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3 text-right">Clicks</th>
            <th className="px-4 py-3">QR</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr
              key={link.code}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
            >
              <td className="px-4 py-3 font-medium text-zinc-900">
                {link.name || <span className="text-zinc-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <a
                  href={shortUrl(link.code)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-600 hover:underline"
                >
                  /r/{link.code}
                </a>
              </td>
              <td className="px-4 py-3">
                <DestinationCell link={link} onSaved={onUpdated} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-700">
                {link.clicks}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadQrPng(shortUrl(link.code), link.name || link.code)
                  }
                  className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Download
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDelete(link)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
