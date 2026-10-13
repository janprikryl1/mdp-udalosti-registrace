"use server";

import type { Event, Registration } from "@prisma/client";
import { isOrganizerAuthenticated } from "@/lib/auth";
import { extractRegistrationId } from "@/lib/qrcode";
import {
  type CheckinResult,
  type CheckinStats,
  checkinParticipant,
  getCheckinStats,
  revertCheckin,
  searchRegistrations,
} from "@/lib/registrations";

export async function verifyAndCheckinAction(
  rawCodeOrInput: string,
  targetEventId?: string,
): Promise<CheckinResult & { cleanedCode?: string }> {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return {
      status: "NOT_FOUND",
      message: "Nejste přihlášeni jako organizátor. Přihlaste se prosím.",
    };
  }

  const cleaned = extractRegistrationId(rawCodeOrInput);
  const result = await checkinParticipant(cleaned, targetEventId);

  return {
    ...result,
    cleanedCode: cleaned,
  };
}

export async function revertCheckinAction(id: string): Promise<{
  success: boolean;
  registration?: (Registration & { event?: Event }) | null;
  error?: string;
}> {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    const updated = await revertCheckin(id);
    return { success: true, registration: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Chyba při stornování",
    };
  }
}

export async function searchRegistrationsAction(
  query: string,
  targetEventId?: string,
): Promise<{
  success: boolean;
  results: (Registration & { event?: Event })[];
  error?: string;
}> {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return {
      success: false,
      results: [],
      error: "Nejste přihlášeni jako organizátor",
    };
  }

  try {
    const results = await searchRegistrations(query, targetEventId);
    return { success: true, results };
  } catch (error) {
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : "Chyba při vyhledávání",
    };
  }
}

export async function getCheckinStatsAction(targetEventId?: string): Promise<{
  success: boolean;
  stats?: CheckinStats;
  error?: string;
}> {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    const stats = await getCheckinStats(targetEventId);
    return { success: true, stats };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při načítání statistik",
    };
  }
}
