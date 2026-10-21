"use server";

import { sendTicketEmail } from "@/lib/email";
import { generateQRCodeDataUrl } from "@/lib/qrcode";
import {
  createOrGetRegistration,
  getRegistrationById,
  getTableReservations,
} from "@/lib/registrations";
import {
  type RegistrationFormData,
  registrationFormSchema,
} from "@/lib/validations";

export interface RegisterResult {
  success: boolean;
  registrationId?: string;
  isNew?: boolean;
  message?: string;
  error?: string;
}

export async function registerParticipantAction(
  data: RegistrationFormData,
): Promise<RegisterResult> {
  const validation = registrationFormSchema.safeParse(data);
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message || "Neplatná data formuláře";
    return { success: false, error: firstError };
  }

  try {
    const { registration, isNew } = await createOrGetRegistration(
      validation.data,
    );

    // Generate QR code data URL
    // QR code contains the registration UUID directly or verification URL
    const qrDataUrl = await generateQRCodeDataUrl(registration.id);

    // Send confirmation email via Resend
    await sendTicketEmail({
      eventName: registration.event?.title,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      city: registration.city,
      registrationId: registration.id,
      tableNumber: registration.tableNumber,
      seatNumber: registration.seatNumber,
      qrCodeDataUrl: qrDataUrl,
    });

    return {
      success: true,
      registrationId: registration.id,
      isNew,
      message: isNew
        ? "Registrace byla úspěšná! Potvrzení s QR kódem bylo odesláno na tvůj e-mail."
        : "Tento e-mail již byl dříve zaregistrován. Znovu jsme ti zobrazili tvůj vstupní kód.",
    };
  } catch (error) {
    console.error("[Registration Error]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Při ukládání registrace došlo k neočekávané chybě. Zkuste to prosím znovu.",
    };
  }
}

export async function getRegistrationDetailsAction(id: string) {
  if (!id || typeof id !== "string") {
    return { success: false, error: "Neplatné ID registrace" };
  }

  try {
    const registration = await getRegistrationById(id);
    if (!registration) {
      return { success: false, error: "Registrace nebyla nalezena" };
    }

    const qrDataUrl = await generateQRCodeDataUrl(registration.id);

    return {
      success: true,
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        eventTitle: registration.event?.title || "Církevní Silvestr",
        eventLocation: registration.event?.location || undefined,
        eventDate: registration.event?.date
          ? registration.event.date.toISOString()
          : undefined,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        city: registration.city,
        tableNumber: registration.tableNumber,
        seatNumber: registration.seatNumber,
        status: registration.status,
        createdAt: registration.createdAt.toISOString(),
      },
      qrDataUrl,
    };
  } catch (error) {
    console.error("[Get Registration Details Error]", error);
    return {
      success: false,
      error: "Nepodařilo se načíst data registrace",
    };
  }
}

export async function getTableStatusAction(eventId?: string) {
  try {
    const result = await getTableReservations(eventId);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[Get Table Status Error]", error);
    return {
      success: false,
      error: "Nepodařilo se načíst stav obsazenosti stolů.",
    };
  }
}
