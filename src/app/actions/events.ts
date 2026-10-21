"use server";

import { isOrganizerAuthenticated } from "@/lib/auth";
import {
  createEvent,
  deleteEvent,
  deleteRegistration,
  getAllEvents,
  getEventRegistrations,
  getEventTableAssignments,
  toggleEventActive,
  updateEventTableCount,
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

export async function deleteEventAction(id: string) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    await deleteEvent(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při mazání události",
    };
  }
}

export async function getEventAttendeesAction(eventId?: string) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return {
      success: false,
      error: "Nejste přihlášeni jako organizátor",
      attendees: [],
    };
  }

  try {
    const attendees = await getEventRegistrations(eventId);
    return { success: true, attendees };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při načítání účastníků",
      attendees: [],
    };
  }
}

export async function deleteAttendeeAction(id: string) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    await deleteRegistration(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při mazání účastníka",
    };
  }
}

export async function updateEventTableCountAction(
  eventId: string,
  tableCount: number,
) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Nejste přihlášeni jako organizátor" };
  }

  try {
    const updated = await updateEventTableCount(eventId, tableCount);
    return { success: true, event: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Chyba při úpravě počtu stolů",
    };
  }
}

export async function getEventTableAssignmentsAction(eventId?: string) {
  const authenticated = await isOrganizerAuthenticated();
  if (!authenticated) {
    return {
      success: false,
      error: "Nejste přihlášeni jako organizátor",
      assignments: [],
      tableCount: 6,
      seatsPerTable: 8,
    };
  }

  try {
    const result = await getEventTableAssignments(eventId);
    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Chyba při načítání obsazenosti stolů",
      assignments: [],
      tableCount: 6,
      seatsPerTable: 8,
    };
  }
}
