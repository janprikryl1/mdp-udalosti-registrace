import { render } from "@react-email/components";
import { Resend } from "resend";
import { TicketEmail } from "@/emails/TicketEmail";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendTicketEmailParams {
  eventName?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  registrationId: string;
  qrCodeDataUrl: string;
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
    const html = await render(
      TicketEmail({
        eventName: eventTitle,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        city: params.city,
        registrationId: params.registrationId,
        qrCodeDataUrl: params.qrCodeDataUrl,
        ticketUrl,
      }),
    );

    if (!resend) {
      console.log(
        `[Dev Email Sim] Resend API klíč není nastaven. E-mail (${eventTitle}) pro ${params.email} (${params.firstName} ${params.lastName}) byl simulován. Vstupenka: ${ticketUrl}`,
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
          : "Neznámá chyba při odesílání e-mailu",
    };
  }
}
