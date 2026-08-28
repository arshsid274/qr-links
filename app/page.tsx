"use client";

import { useCallback, useEffect, useState } from "react";
import type { LinkRow } from "@/lib/db";
import {
  readStoredBaseUrl,
  resolveBaseUrl,
  shortUrlFor,
  storeBaseUrl,
} from "@/lib/baseUrl";
import LinkForm from "./components/LinkForm";
import LinkTable from "./components/LinkTable";
import QRDisplay from "./components/QRDisplay";

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [justCreated, setJustCreated] = useState<LinkRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The base URL baked into QR codes. `stored` is the user's custom value ("" =
  // use the current domain); `baseUrl` is the effective value used everywhere.
  const [stored, setStored] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [draft, setDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const s = readStoredBaseUrl();
    setStored(s);
    setDraft(s);
    setBaseUrl(resolveBaseUrl(s));
  }, []);

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

  function saveBaseUrl() {
    storeBaseUrl(draft);
    const s = readStoredBaseUrl();
    setStored(s);
    setBaseUrl(resolveBaseUrl(s));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function useThisDomain() {
    storeBaseUrl("");
    setStored("");
    setDraft("");
    setBaseUrl(resolveBaseUrl(""));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">QR Links</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Dynamic QR codes — print once, change where they point any time.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">
            QR base URL
          </label>
          <p className="text-xs text-zinc-500">
            The address baked into every QR code. Leave blank to use the domain
            you&apos;re on now ({resolveBaseUrl("") || "this site"}).
          </p>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://qr.mydomain.com"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            type="button"
            onClick={saveBaseUrl}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={useThisDomain}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Use this domain
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          QR codes currently point to{" "}
          <span className="font-mono text-zinc-700">{baseUrl || "…"}</span>
          {stored ? " (custom)" : " (this domain)"}
          {savedFlash && (
            <span className="ml-2 font-medium text-green-600">Saved</span>
          )}
        </p>
      </section>

      <LinkForm
        onCreated={(link) => {
          setJustCreated(link);
          setLinks((prev) => (prev ? [link, ...prev] : [link]));
        }}
      />

      {justCreated && baseUrl && (
        <section className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">
            {justCreated.name || justCreated.code} — ready to print
          </h2>
          <QRDisplay
            url={shortUrlFor(baseUrl, justCreated.code)}
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
            baseUrl={baseUrl}
            onUpdated={(updated) =>
              setLinks((prev) =>
                // Match by id, not code — the code itself is editable.
                prev
                  ? prev.map((l) => (l.id === updated.id ? updated : l))
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
