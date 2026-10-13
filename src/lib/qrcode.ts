import QRCode from "qrcode";

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 400,
      color: {
        dark: "#1e1b4b", // deep navy/slate
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Failed to generate QR code data URL:", error);
    throw new Error("Failed to generate QR code data URL");
  }
}

export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 400,
      color: {
        dark: "#1e1b4b", // deep navy/slate
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Failed to generate QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
}

/**
 * Extracts a registration ID or code from raw scanned input.
 * Handles:
 * - Direct UUID / ID string: "c796b34a-95ee-46a4-97c3-30528e188f57"
 * - URL with ?code= or ?id=: "https://silvestr.dpv.cz/checkin?code=c796b34a-..."
 * - JSON string: '{"id": "c796b34a-..."}'
 */
export function extractRegistrationId(input: string): string {
  const trimmed = input.trim();

  // Try URL parsing
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const codeParam =
        url.searchParams.get("code") || url.searchParams.get("id");
      if (codeParam) {
        return codeParam.trim();
      }
      // If path ends with an ID
      const segments = url.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && (last.length >= 8 || last.includes("-"))) {
        return last.trim();
      }
    } catch {
      // Not a valid URL, continue
    }
  }

  // Try JSON parsing
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.id === "string") return parsed.id.trim();
      if (typeof parsed.code === "string") return parsed.code.trim();
    } catch {
      // Not valid JSON, continue
    }
  }

  return trimmed;
}
