import { render } from "@react-email/components";
import { Resend } from "resend";
import { TicketEmail } from "@/emails/TicketEmail";
import { generateQRCodeBuffer } from "./qrcode";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendTicketEmailParams {
  eventName?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  registrationId: string;
  qrCodeDataUrl?: string;
  qrCodeBuffer?: Buffer;
}

export async function sendTicketEmail(params: SendTicketEmailParams): Promise<{
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
}> {
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
        qrCodeSrc: "cid:ticket-qr-code",
        ticketUrl,
      }),
    );

    if (!resend) {
      console.log(
        `[Email Simulation] RESEND_API_KEY is not set. Ticket email (${eventTitle}) for ${params.email} (${params.firstName} ${params.lastName}) simulated. URL: ${ticketUrl}`,
      );
      return { success: true, simulated: true };
    }

    const fromAddress =
      process.env.EMAIL_FROM || "Církevní Silvestr <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: params.email,
      subject: `Potvrzení registrace na ${eventTitle} (vstupní QR kód)`,
      html,
      attachments: [
        {
          filename: `vstupenka-qr-${params.registrationId.slice(0, 8)}.png`,
          content: base64Image,
          contentType: "image/png",
          contentId: "ticket-qr-code",
        },
      ],
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
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
