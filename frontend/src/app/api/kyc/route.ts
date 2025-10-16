import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // lets us verify the route is wired
  return NextResponse.json({ route: "/api/kyc", ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("id_image") as unknown as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing id_image" }, { status: 400 });
    }

    const kycBase = process.env.KYC_SERVICE_URL || "http://kyc:4100/kyc";
    const kycUrl = `${kycBase}/verify`;

    const fwd = new FormData();
    fwd.append("id_image", file, (file as any).name || "id.jpg");

    const r = await fetch(kycUrl, { method: "POST", body: fwd });
    const raw = await r.text();
    const ct = r.headers.get("content-type") || "";

    if (!ct.includes("application/json")) {
      // Force JSON back to browser even if upstream returned HTML
      return NextResponse.json(
        { error: "kyc_upstream_not_json", status: r.status, contentType: ct, bodySnippet: raw.slice(0, 200) },
        { status: 502 }
      );
    }

    const upstream = JSON.parse(raw);
    const normalized = {
      ok: Boolean(upstream.ok ?? upstream.verified ?? upstream.isOfAge),
      verified: Boolean(upstream.isOfAge ?? upstream.verified ?? false),
      isOfAge: Boolean(upstream.isOfAge ?? upstream.verified ?? false),
      dobISO: upstream.dobISO ?? upstream.dob ?? null,
      ocrPreview: upstream.ocrPreview ?? null,
      _raw: upstream,
    };

    return NextResponse.json(normalized, { status: r.ok ? 200 : 502 });
  } catch (e: any) {
    return NextResponse.json({ error: "verify_failed", detail: String(e?.message || e).slice(0, 200) }, { status: 500 });
  }
}