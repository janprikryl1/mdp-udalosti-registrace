"use server";

import { isOrganizerAuthenticated } from "@/lib/auth";
import {
  createEvent,
  getAllEvents,
  toggleEventActive,
} from "@/lib/registrations";
import { type EventFormData, eventFormSchema } from "@/lib/validations";

export async function getEventsAction() {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return {
      success: false,
      error: "Nejste přihlášeni jako organizátor",
      events: [],
    };
  }

  try {
    const events = await getAllEvents();
    return { success: true, events };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při načítání událostí",
      events: [],
    };
  }
}

export async function createEventAction(data: EventFormData) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  const validation = eventFormSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Neplatná data události",
    };
  }

  try {
    const newEvent = await createEvent(validation.data);
    return { success: true, event: newEvent };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při vytváření události",
    };
  }
}

export async function toggleEventActiveAction(id: string) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    const updated = await toggleEventActive(id);
    return { success: true, event: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Chyba při změně stavu události",
    };
  }
}
