"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

// Renders at high resolution for crisp downloads regardless of display size.
const EXPORT_SIZE = 1024;

export async function downloadQrPng(url: string, filename: string) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: EXPORT_SIZE,
    margin: 2,
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.png`;
  a.click();
}

export default function QRDisplay({
  url,
  filename,
  size = 176,
}: {
  url: string;
  filename: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 2 });
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg border border-zinc-200" />
      <p className="max-w-full break-all font-mono text-xs text-zinc-500">
        {url}
      </p>
      <button
        type="button"
        onClick={() => downloadQrPng(url, filename)}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Download PNG
      </button>
    </div>
  );
}
