// frontend/src/app/compte/kyc/page.tsx
"use client";
import { useState } from "react";

export default function KycPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/kyc", { method: "POST", body: form });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); }
      catch { throw new Error(`Non-JSON from API (${res.status}): ${text.slice(0,120)}…`); }

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `KYC failed (${res.status})`);
      }
      setResult(data);
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">KYC — Age Verification</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="file" name="id_image" accept="image/*" required />
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {loading ? "Verifying…" : "Verify age"}
        </button>
      </form>
      {err && <p className="text-red-600 text-sm">Error: {err}</p>}
      {result && <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}