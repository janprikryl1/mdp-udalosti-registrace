import { NextResponse } from "next/server";
import { generateQRCodeBuffer } from "@/lib/qrcode";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    if (!code) {
      return new NextResponse("Chybí parametr kódu", { status: 400 });
    }

    // Strip .png extension if requested (e.g. /api/qr/uuid.png)
    const cleanCode = code.replace(/\.png$/i, "").trim();
    if (!cleanCode) {
      return new NextResponse("Neplatný kód", { status: 400 });
    }

    const buffer = await generateQRCodeBuffer(cleanCode);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="vstupenka-qr-${cleanCode.slice(0, 8)}.png"`,
      },
    });
  } catch (error) {
    console.error("[QR API Error]", error);
    return new NextResponse("Chyba při generování QR kódu", { status: 500 });
  }
}
