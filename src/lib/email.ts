import { render } from "@react-email/components";
import { TicketEmail } from "@/emails/TicketEmail";
import { generateQRCodeBuffer } from "./qrcode";

const brevoApiKey = process.env.BREVO_API_KEY;

export interface SendTicketEmailParams {
  eventName?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  registrationId: string;
  tableNumber?: number | null;
  seatNumber?: number | null;
  qrCodeDataUrl?: string;
  qrCodeBuffer?: Buffer;
}

export interface SendTicketEmailResult {
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
}

export async function sendTicketEmail(
  params: SendTicketEmailParams,
): Promise<SendTicketEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ticketUrl = `${appUrl}/registrace/uspech?id=${params.registrationId}`;
  const eventTitle = params.eventName || "Církevní Silvestr";

  try {
    // Extract base64 image payload (without data: prefix) for the inline MIME attachment.
    // Gmail strictly blocks data:image/... URIs in <img>, but renders inline attachments with matching contentId (cid:).
    let base64Image = "";
    if (params.qrCodeBuffer) {
      base64Image = params.qrCodeBuffer.toString("base64");
    } else if (params.qrCodeDataUrl) {
      base64Image = params.qrCodeDataUrl.includes("base64,")
        ? params.qrCodeDataUrl.split("base64,")[1]
        : params.qrCodeDataUrl;
    }

    if (!base64Image) {
      const buffer = await generateQRCodeBuffer(params.registrationId);
      base64Image = buffer.toString("base64");
    }

    const html = await render(
      TicketEmail({
        eventName: eventTitle,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        city: params.city,
        registrationId: params.registrationId,
        tableNumber: params.tableNumber,
        seatNumber: params.seatNumber,
        qrCodeSrc: `${appUrl}/api/qr/${params.registrationId}.png`,
        ticketUrl,
      }),
    );

    if (!brevoApiKey) {
      console.log(
        `[Email Simulation] BREVO_API_KEY is not set. Ticket email (${eventTitle}) for ${params.email} (${params.firstName} ${params.lastName}) simulated. URL: ${ticketUrl}`,
      );
      return { success: true, simulated: true };
    }

    const configuredSender =
      process.env.EMAIL_FROM || "Církevní Silvestr <tickets@example.com>";
    const senderMatch = configuredSender.match(/^(.*)<([^<>]+)>$/);
    const sender = senderMatch
      ? { name: senderMatch[1].trim(), email: senderMatch[2].trim() }
      : { email: configuredSender.trim() };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: params.email, name: `${params.firstName} ${params.lastName}` }],
        subject: `Potvrzení registrace na ${eventTitle} (vstupní QR kód)`,
        htmlContent: html,
        attachment: [
          {
            name: `vstupenka-qr-${params.registrationId.slice(0, 8)}.png`,
            content: base64Image,
          },
        ],
      }),
    });

    const result = (await response.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
      code?: string;
    };

    if (!response.ok) {
      const error = result.message || `Brevo API returned HTTP ${response.status}`;
      console.error("[Brevo Error]", { status: response.status, error });
      return { success: false, error };
    }

    return { success: true, id: result.messageId };
  } catch (error) {
    console.error("[Email Send Error]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while sending email",
    };
  }
}
