"use client";

import React, { useState } from "react";

export default function KycPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setResult(null);
    setError(null);
    if (!f) return;
    // basic client-side checks
    const maxMB = 10;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`File too large (>${maxMB}MB).`);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Only JPG/PNG/WEBP allowed.");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSending(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("id_image", file);
      // TODO: replace with real user id from session when ready
      fd.append("userId", "DEMO-USER-123");

      const res = await fetch("/api/kyc/verify", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "KYC failed");
      setResult(json);
    } catch (err: any) {
      setError(err?.message || "KYC failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Vérification d’âge (KYC)</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={onSelect}
          className="block w-full border rounded p-2"
        />
        <button
          type="submit"
          disabled={!file || sending}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {sending ? "Analyse..." : "Envoyer"}
        </button>
      </form>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 rounded bg-green-50 text-green-800 border border-green-200 space-y-1">
          <div><b>Vérifié :</b> {String(result.verified)}</div>
          <div><b>Date de naissance détectée :</b> {result.dob ?? "—"}</div>
          <div><b>Artefact (MinIO) :</b> {result.artifact}</div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Astuce: utilisez une image contenant une date comme <code>01/01/2000</code>.
      </p>
    </main>
  );
}