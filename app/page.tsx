"use client";

import { useCallback, useEffect, useState } from "react";
import type { LinkRow } from "@/lib/db";
import LinkForm, { type CreatedLink } from "./components/LinkForm";
import LinkTable from "./components/LinkTable";
import QRDisplay from "./components/QRDisplay";

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [justCreated, setJustCreated] = useState<CreatedLink | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error(`Failed to load links (${res.status})`);
      setLinks(await res.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">QR Links</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Dynamic QR codes — print once, change the destination any time.
        </p>
      </header>

      <LinkForm
        onCreated={(link) => {
          setJustCreated(link);
          setLinks((prev) => (prev ? [link, ...prev] : [link]));
        }}
      />

      {justCreated && (
        <section className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">
            {justCreated.name || justCreated.code} — ready to print
          </h2>
          <QRDisplay
            url={justCreated.qrUrl}
            filename={justCreated.name || justCreated.code}
          />
        </section>
      )}

      <section className="mt-8">
        {loadError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError} — is POSTGRES_URL configured and the links table
            created?
          </p>
        ) : links === null ? (
          <p className="p-4 text-sm text-zinc-500">Loading…</p>
        ) : (
          <LinkTable
            links={links}
            onUpdated={(updated) =>
              setLinks((prev) =>
                prev
                  ? prev.map((l) => (l.code === updated.code ? updated : l))
                  : prev
              )
            }
            onDeleted={(code) =>
              setLinks((prev) =>
                prev ? prev.filter((l) => l.code !== code) : prev
              )
            }
          />
        )}
      </section>
    </main>
  );
}
