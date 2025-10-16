import { NextRequest, NextResponse } from "next/server";
// If Prisma is ready, uncomment:
// import { PrismaClient, KycStatus } from "@prisma/client";
// const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("id_image") as unknown as File | null;
    const userId = form.get("userId") as string | null; // TEMP: until you wire session

    if (!file /* || !userId */) {
      // keep userId optional for now so you can test without DB
      return NextResponse.json({ error: "Missing id_image" }, { status: 400 });
    }

    const kycUrl = (process.env.KYC_SERVICE_URL || "http://kyc:4100") + "/verify";

    const fwd = new FormData();
    fwd.append("id_image", file, (file as any).name || "id.jpg");

    const r = await fetch(kycUrl, { method: "POST", body: fwd as any });
    const data = await r.json();

    // --- Optional DB update (uncomment when Prisma migration done) ---
    // const outcome: KycStatus = data.verified ? "VERIFIED" : "REJECTED";
    // const dobIso = data.dob ? data.dob.split(/[\/\-.]/).reverse().join("-") : null;
    // if (userId) {
    //   await prisma.user.update({
    //     where: { id: userId },
    //     data: {
    //       kycStatus: outcome,
    //       dateOfBirth: dobIso ? new Date(dobIso) : null,
    //       kycVerifiedAt: data.verified ? new Date() : null,
    //       kycNote: data.artifact ? `artifact:${data.artifact}` : null,
    //     },
    //   });
    //   await prisma.kycVerification.create({
    //     data: {
    //       userId,
    //       outcome,
    //       dobText: data.dob || null,
    //       artifactKey: data.artifact || null,
    //     },
    //   });
    // }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: "verify_failed", detail: e?.message }, { status: 500 });
  }
}