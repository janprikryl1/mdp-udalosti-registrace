import type { Event, Registration } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// In-memory fallback cache for offline dev if Postgres is not yet configured locally
const memoryEvents = new Map<string, Event>();
const memoryRegistrations = new Map<string, Registration>();

const DEFAULT_EVENT_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_EVENT: Event = {
  id: DEFAULT_EVENT_ID,
  slug: "cirkevni-silvestr-2026",
  title: "Církevní Silvestr 2026 – Malý princ",
  description:
    "Plesové setkání a oslava přelomu církevního roku na téma Malý princ",
  date: new Date("2026-11-28T18:00:00Z"),
  location: "Brodek u Prostějova",
  isActive: true,
  tableCount: 6,
  seatsPerTable: 8,
  createdAt: new Date(),
  updatedAt: new Date(),
};
memoryEvents.set(DEFAULT_EVENT_ID, DEFAULT_EVENT);

function isPrismaConnectionError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const err = error as { code?: string; message?: string };
    if (
      err.code === "P1001" ||
      err.code === "P1003" ||
      err.code === "P1017" ||
      err.code === "P2021" ||
      err.code === "P2024"
    ) {
      return true;
    }
    if (
      typeof err.message === "string" &&
      (err.message.includes("Can't reach database server") ||
        err.message.includes("does not exist in the current database") ||
        err.message.includes("Environment variable not found") ||
        err.message.includes("Authentication failed"))
    ) {
      return true;
    }
  }
  return false;
}

export type CheckinResult =
  | {
      status: "SUCCESS";
      message: string;
      registration: Registration & { event?: Event };
    }
  | {
      status: "ALREADY_CHECKED_IN";
      message: string;
      registration: Registration & { event?: Event };
    }
  | {
      status: "WRONG_EVENT";
      message: string;
      registration: Registration & { event?: Event };
    }
  | {
      status: "NOT_FOUND";
      message: string;
      registration?: undefined;
    };

export interface CheckinStats {
  eventId?: string;
  eventName?: string;
  total: number;
  attended: number;
  remaining: number;
  recentAttended: (Registration & { event?: Event })[];
}

export interface EventWithCounts extends Event {
  _count?: {
    registrations: number;
  };
  totalCount?: number;
  attendedCount?: number;
}

// Ensure at least one default event exists in DB
export async function ensureDefaultEvent(): Promise<Event> {
  try {
    let event = await prisma.event.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    if (!event) {
      event = await prisma.event.create({
        data: {
          slug: "cirkevni-silvestr-2026",
          title: "Církevní Silvestr 2026 – Malý princ",
          description:
            "Tradiční silvestrovské setkání a oslava mládeže děkanátu Prostějov",
          date: new Date("2026-11-28T18:00:00Z"),
          location: "Brodek u Prostějova",
          isActive: true,
          tableCount: 6,
          seatsPerTable: 8,
        },
      });
    }

    return event;
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return DEFAULT_EVENT;
    }
    throw error;
  }
}

export async function getAllEvents(): Promise<EventWithCounts[]> {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        registrations: {
          select: { id: true, status: true },
        },
      },
    });

    if (events.length === 0) {
      const def = await ensureDefaultEvent();
      return [
        {
          ...def,
          totalCount: 0,
          attendedCount: 0,
        },
      ];
    }

    return events.map((e) => ({
      ...e,
      totalCount: e.registrations.length,
      attendedCount: e.registrations.filter((r) => r.status === "ATTENDED")
        .length,
    }));
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const allEvents = Array.from(memoryEvents.values());
      return allEvents.map((e) => {
        const regs = Array.from(memoryRegistrations.values()).filter(
          (r) => r.eventId === e.id,
        );
        return {
          ...e,
          totalCount: regs.length,
          attendedCount: regs.filter((r) => r.status === "ATTENDED").length,
        };
      });
    }
    throw error;
  }
}

export async function getEventByIdOrSlug(
  idOrSlug: string,
): Promise<Event | null> {
  try {
    return await prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      for (const e of memoryEvents.values()) {
        if (e.id === idOrSlug || e.slug === idOrSlug.toLowerCase()) {
          return e;
        }
      }
      return DEFAULT_EVENT;
    }
    throw error;
  }
}

export async function createEvent(data: {
  title: string;
  slug?: string;
  description?: string;
  date?: string;
  location?: string;
  tableCount?: number;
  seatsPerTable?: number;
  isActive?: boolean;
}): Promise<Event> {
  const generatedSlug =
    data.slug?.trim() ||
    data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    `akce-${Date.now()}`;

  const eventDate = data.date ? new Date(data.date) : null;
  const tableCount = data.tableCount
    ? Math.max(1, Math.min(50, data.tableCount))
    : 6;
  const seatsPerTable = data.seatsPerTable
    ? Math.max(1, Math.min(20, data.seatsPerTable))
    : 8;

  try {
    return await prisma.event.create({
      data: {
        title: data.title.trim(),
        slug: generatedSlug,
        description: data.description?.trim(),
        date: eventDate,
        location: data.location?.trim(),
        tableCount,
        seatsPerTable,
        isActive: data.isActive ?? true,
      },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const id = crypto.randomUUID();
      const newEvent: Event = {
        id,
        title: data.title.trim(),
        slug: generatedSlug,
        description: data.description?.trim() || null,
        date: eventDate,
        location: data.location?.trim() || null,
        tableCount,
        seatsPerTable,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryEvents.set(id, newEvent);
      return newEvent;
    }
    throw error;
  }
}

export async function updateEventTableCount(
  id: string,
  tableCount: number,
): Promise<Event | null> {
  const count = Math.max(1, Math.min(50, tableCount));
  try {
    return await prisma.event.update({
      where: { id },
      data: { tableCount: count },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const event = memoryEvents.get(id);
      if (event) {
        event.tableCount = count;
        event.updatedAt = new Date();
        return event;
      }
      return null;
    }
    throw error;
  }
}

export async function toggleEventActive(id: string): Promise<Event | null> {
  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return null;
    return await prisma.event.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const event = memoryEvents.get(id);
      if (event) {
        event.isActive = !event.isActive;
        return event;
      }
      return null;
    }
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    await prisma.event.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      memoryEvents.delete(id);
      for (const [regId, reg] of memoryRegistrations.entries()) {
        if (reg.eventId === id) {
          memoryRegistrations.delete(regId);
        }
      }
      return true;
    }
    throw error;
  }
}

export async function getEventRegistrations(
  eventId?: string,
): Promise<(Registration & { event?: Event })[]> {
  try {
    return await prisma.registration.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const list = Array.from(memoryRegistrations.values()).filter(
        (r) => !eventId || r.eventId === eventId,
      );
      return list
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((r) => ({
          ...r,
          event: memoryEvents.get(r.eventId) || DEFAULT_EVENT,
        }));
    }
    throw error;
  }
}

export async function deleteRegistration(id: string): Promise<boolean> {
  try {
    await prisma.registration.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return memoryRegistrations.delete(id);
    }
    throw error;
  }
}

export async function createOrGetRegistration(data: {
  eventId?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  tableNumber?: number | null;
  seatNumber?: number | null;
}): Promise<{ registration: Registration & { event: Event }; isNew: boolean }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // Resolve event
  let event: Event | null = null;
  if (data.eventId) {
    event = await getEventByIdOrSlug(data.eventId);
  }
  if (!event) {
    event = await ensureDefaultEvent();
  }

  const reqTable =
    typeof data.tableNumber === "number" && data.tableNumber > 0
      ? data.tableNumber
      : null;
  const reqSeat =
    typeof data.seatNumber === "number" && data.seatNumber > 0
      ? data.seatNumber
      : null;

  if (reqTable !== null && reqSeat !== null) {
    const maxTables = event.tableCount || 6;
    const maxSeats = event.seatsPerTable || 8;
    if (reqTable < 1 || reqTable > maxTables) {
      throw new Error(
        `Neplatné číslo stolu (${reqTable}). K dispozici je 1 až ${maxTables} stolů.`,
      );
    }
    if (reqSeat < 1 || reqSeat > maxSeats) {
      throw new Error(
        `Neplatné číslo místa (${reqSeat}). Každý stůl má ${maxSeats} míst.`,
      );
    }
  }

  try {
    // Check if table + seat is already taken
    if (reqTable !== null && reqSeat !== null) {
      const occupied = await prisma.registration.findFirst({
        where: {
          eventId: event.id,
          tableNumber: reqTable,
          seatNumber: reqSeat,
          NOT: { email: { equals: normalizedEmail, mode: "insensitive" } },
        },
      });

      if (occupied) {
        throw new Error(
          `Místo u stolu ${reqTable} (židle ${reqSeat}) bylo právě obsazeno jiným účastníkem. Vyberte si prosím jiné volné místo.`,
        );
      }
    }

    const existing = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      include: { event: true },
    });

    if (existing) {
      if (
        reqTable !== null &&
        reqSeat !== null &&
        (existing.tableNumber !== reqTable || existing.seatNumber !== reqSeat)
      ) {
        const updated = await prisma.registration.update({
          where: { id: existing.id },
          data: {
            tableNumber: reqTable,
            seatNumber: reqSeat,
          },
          include: { event: true },
        });
        return { registration: updated, isNew: false };
      }
      return { registration: existing, isNew: false };
    }

    const created = await prisma.registration.create({
      data: {
        eventId: event.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: normalizedEmail,
        city: data.city.trim(),
        tableNumber: reqTable,
        seatNumber: reqSeat,
        status: "REGISTERED",
      },
      include: { event: true },
    });

    return { registration: created, isNew: true };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.warn(
        "[Dev Fallback] Database not reachable, using in-memory store.",
      );

      // Check if seat already taken in memory
      if (reqTable !== null && reqSeat !== null) {
        for (const reg of memoryRegistrations.values()) {
          if (
            reg.eventId === event.id &&
            reg.tableNumber === reqTable &&
            reg.seatNumber === reqSeat &&
            reg.email.toLowerCase() !== normalizedEmail
          ) {
            throw new Error(
              `Místo u stolu ${reqTable} (židle ${reqSeat}) bylo právě obsazeno jiným účastníkem. Vyberte si prosím jiné volné místo.`,
            );
          }
        }
      }

      for (const reg of memoryRegistrations.values()) {
        if (
          reg.eventId === event.id &&
          reg.email.toLowerCase() === normalizedEmail
        ) {
          if (reqTable !== null && reqSeat !== null) {
            reg.tableNumber = reqTable;
            reg.seatNumber = reqSeat;
            reg.updatedAt = new Date();
          }
          return { registration: { ...reg, event }, isNew: false };
        }
      }

      const id = crypto.randomUUID();
      const mockReg: Registration = {
        id,
        eventId: event.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: normalizedEmail,
        city: data.city.trim(),
        tableNumber: reqTable,
        seatNumber: reqSeat,
        status: "REGISTERED",
        attendedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRegistrations.set(id, mockReg);
      return { registration: { ...mockReg, event }, isNew: true };
    }
    throw error;
  }
}

export interface TableReservationStatus {
  tableCount: number;
  seatsPerTable: number;
  reservedSeats: { tableNumber: number; seatNumber: number }[];
}

export async function getTableReservations(
  eventId?: string,
): Promise<TableReservationStatus> {
  let event: Event | null = null;
  if (eventId) {
    event = await getEventByIdOrSlug(eventId);
  }
  if (!event) {
    event = await ensureDefaultEvent();
  }

  const tableCount = event.tableCount || 6;
  const seatsPerTable = event.seatsPerTable || 8;

  try {
    const list = await prisma.registration.findMany({
      where: {
        eventId: event.id,
        tableNumber: { not: null },
        seatNumber: { not: null },
      },
      select: {
        tableNumber: true,
        seatNumber: true,
      },
    });

    const reservedSeats = list
      .filter(
        (r): r is { tableNumber: number; seatNumber: number } =>
          r.tableNumber !== null && r.seatNumber !== null,
      )
      .map((r) => ({
        tableNumber: r.tableNumber,
        seatNumber: r.seatNumber,
      }));

    return {
      tableCount,
      seatsPerTable,
      reservedSeats,
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const reservedSeats: { tableNumber: number; seatNumber: number }[] = [];
      for (const r of memoryRegistrations.values()) {
        if (
          r.eventId === event.id &&
          r.tableNumber !== null &&
          r.tableNumber !== undefined &&
          r.seatNumber !== null &&
          r.seatNumber !== undefined
        ) {
          reservedSeats.push({
            tableNumber: r.tableNumber,
            seatNumber: r.seatNumber,
          });
        }
      }
      return {
        tableCount,
        seatsPerTable,
        reservedSeats,
      };
    }
    throw error;
  }
}

export interface SeatAssignmentInfo {
  tableNumber: number;
  seatNumber: number;
  registration: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    status: string;
  };
}

export interface EventTableAssignments {
  tableCount: number;
  seatsPerTable: number;
  assignments: SeatAssignmentInfo[];
}

export async function getEventTableAssignments(
  eventId?: string,
): Promise<EventTableAssignments> {
  let event: Event | null = null;
  if (eventId) {
    event = await getEventByIdOrSlug(eventId);
  }
  if (!event) {
    event = await ensureDefaultEvent();
  }

  const tableCount = event.tableCount || 6;
  const seatsPerTable = event.seatsPerTable || 8;

  try {
    const list = await prisma.registration.findMany({
      where: {
        eventId: event.id,
        tableNumber: { not: null },
        seatNumber: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        status: true,
        tableNumber: true,
        seatNumber: true,
      },
    });

    return {
      tableCount,
      seatsPerTable,
      assignments: list
        .filter(
          (r): r is typeof r & { tableNumber: number; seatNumber: number } =>
            r.tableNumber !== null && r.seatNumber !== null,
        )
        .map((r) => ({
          tableNumber: r.tableNumber,
          seatNumber: r.seatNumber,
          registration: {
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            city: r.city,
            status: r.status,
          },
        })),
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const assignments: SeatAssignmentInfo[] = [];
      for (const r of memoryRegistrations.values()) {
        if (
          r.eventId === event.id &&
          r.tableNumber !== null &&
          r.tableNumber !== undefined &&
          r.seatNumber !== null &&
          r.seatNumber !== undefined
        ) {
          assignments.push({
            tableNumber: r.tableNumber,
            seatNumber: r.seatNumber,
            registration: {
              id: r.id,
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              city: r.city,
              status: r.status,
            },
          });
        }
      }
      return {
        tableCount,
        seatsPerTable,
        assignments,
      };
    }
    throw error;
  }
}

export async function getRegistrationById(
  id: string,
): Promise<(Registration & { event: Event }) | null> {
  try {
    return await prisma.registration.findUnique({
      where: { id },
      include: { event: true },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const reg = memoryRegistrations.get(id);
      if (!reg) return null;
      const event = memoryEvents.get(reg.eventId) || DEFAULT_EVENT;
      return { ...reg, event };
    }
    throw error;
  }
}

export async function checkinParticipant(
  codeOrEmail: string,
  targetEventId?: string,
): Promise<CheckinResult> {
  const cleaned = codeOrEmail.trim();
  if (!cleaned) {
    return {
      status: "NOT_FOUND",
      message: "Nebyl zadán žádný kód ani e-mail.",
    };
  }

  try {
    // 1. Try finding by ID
    let registration = await prisma.registration.findUnique({
      where: { id: cleaned },
      include: { event: true },
    });

    // 2. If not found by ID, try finding by email
    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: {
          email: { equals: cleaned.toLowerCase(), mode: "insensitive" },
          ...(targetEventId ? { eventId: targetEventId } : {}),
        },
        include: { event: true },
      });
    }

    if (!registration) {
      return {
        status: "NOT_FOUND",
        message: `Kód nebo e-mail "${cleaned}" nebyl v databázi nalezen.`,
      };
    }

    // Multi-event verification check!
    if (targetEventId && registration.eventId !== targetEventId) {
      return {
        status: "WRONG_EVENT",
        message: `POZOR: Tento kód je platný pro akci "${registration.event.title}", nikoli pro aktuálně vybranou událost!`,
        registration,
      };
    }

    // Check if already attended
    if (registration.status === "ATTENDED") {
      return {
        status: "ALREADY_CHECKED_IN",
        message: `POZOR: Již uplatněno! ${registration.firstName} ${registration.lastName} byl(a) odbaven(a) v ${
          registration.attendedAt
            ? new Intl.DateTimeFormat("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }).format(new Date(registration.attendedAt))
            : "dřívějším čase"
        }.`,
        registration,
      };
    }

    // Mark as attended
    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: "ATTENDED",
        attendedAt: new Date(),
      },
      include: { event: true },
    });

    return {
      status: "SUCCESS",
      message: `Platná registrace (${updated.event.title}): ${updated.firstName} ${updated.lastName}, vítejte! Můžou jít.`,
      registration: updated,
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.warn(
        "[Dev Fallback] Database not reachable, using in-memory checkin.",
      );
      let found: Registration | undefined = memoryRegistrations.get(cleaned);

      if (!found) {
        for (const reg of memoryRegistrations.values()) {
          if (reg.email.toLowerCase() === cleaned.toLowerCase()) {
            if (!targetEventId || reg.eventId === targetEventId) {
              found = reg;
              break;
            }
          }
        }
      }

      if (!found) {
        return {
          status: "NOT_FOUND",
          message: `Kód nebo e-mail "${cleaned}" nebyl v databázi nalezen.`,
        };
      }

      const event = memoryEvents.get(found.eventId) || DEFAULT_EVENT;

      if (targetEventId && found.eventId !== targetEventId) {
        return {
          status: "WRONG_EVENT",
          message: `POZOR: Tento kód je platný pro akci "${event.title}", nikoli pro vybranou akci!`,
          registration: { ...found, event },
        };
      }

      if (found.status === "ATTENDED") {
        return {
          status: "ALREADY_CHECKED_IN",
          message: `POZOR: Již uplatněno! ${found.firstName} ${found.lastName} byl(a) odbaven(a).`,
          registration: { ...found, event },
        };
      }

      found.status = "ATTENDED";
      found.attendedAt = new Date();
      found.updatedAt = new Date();
      memoryRegistrations.set(found.id, found);

      return {
        status: "SUCCESS",
        message: `Platná registrace (${event.title}): ${found.firstName} ${found.lastName}, vítejte! Můžou jít.`,
        registration: { ...found, event },
      };
    }
    throw error;
  }
}

export async function revertCheckin(
  id: string,
): Promise<(Registration & { event?: Event }) | null> {
  try {
    return await prisma.registration.update({
      where: { id },
      data: {
        status: "REGISTERED",
        attendedAt: null,
      },
      include: { event: true },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const reg = memoryRegistrations.get(id);
      if (reg) {
        reg.status = "REGISTERED";
        reg.attendedAt = null;
        reg.updatedAt = new Date();
        memoryRegistrations.set(id, reg);
        const event = memoryEvents.get(reg.eventId);
        return { ...reg, event };
      }
      return null;
    }
    throw error;
  }
}

export async function getCheckinStats(
  targetEventId?: string,
): Promise<CheckinStats> {
  try {
    let eventName: string | undefined;
    const filter = targetEventId ? { eventId: targetEventId } : {};

    if (targetEventId) {
      const ev = await prisma.event.findUnique({
        where: { id: targetEventId },
      });
      eventName = ev?.title;
    }

    const [total, attended, recentAttended] = await Promise.all([
      prisma.registration.count({ where: filter }),
      prisma.registration.count({
        where: { ...filter, status: "ATTENDED" },
      }),
      prisma.registration.findMany({
        where: { ...filter, status: "ATTENDED" },
        orderBy: { attendedAt: "desc" },
        take: 8,
        include: { event: true },
      }),
    ]);

    return {
      eventId: targetEventId,
      eventName,
      total,
      attended,
      remaining: Math.max(0, total - attended),
      recentAttended,
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const all = Array.from(memoryRegistrations.values()).filter(
        (r) => !targetEventId || r.eventId === targetEventId,
      );
      const total = all.length;
      const attendedList = all
        .filter((r) => r.status === "ATTENDED")
        .sort(
          (a, b) =>
            (b.attendedAt?.getTime() ?? 0) - (a.attendedAt?.getTime() ?? 0),
        );
      const attended = attendedList.length;

      const ev = targetEventId ? memoryEvents.get(targetEventId) : undefined;

      return {
        eventId: targetEventId,
        eventName: ev?.title,
        total,
        attended,
        remaining: Math.max(0, total - attended),
        recentAttended: attendedList.slice(0, 8).map((r) => ({
          ...r,
          event: memoryEvents.get(r.eventId) || DEFAULT_EVENT,
        })),
      };
    }
    throw error;
  }
}

export async function searchRegistrations(
  query: string,
  targetEventId?: string,
): Promise<(Registration & { event?: Event })[]> {
  const cleaned = query.trim();
  if (!cleaned) return [];

  try {
    return await prisma.registration.findMany({
      where: {
        ...(targetEventId ? { eventId: targetEventId } : {}),
        OR: [
          { firstName: { contains: cleaned, mode: "insensitive" } },
          { lastName: { contains: cleaned, mode: "insensitive" } },
          { email: { contains: cleaned, mode: "insensitive" } },
          { city: { contains: cleaned, mode: "insensitive" } },
          { id: { equals: cleaned } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      const q = cleaned.toLowerCase();
      const results = Array.from(memoryRegistrations.values()).filter(
        (r) =>
          (!targetEventId || r.eventId === targetEventId) &&
          (r.firstName.toLowerCase().includes(q) ||
            r.lastName.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.id.toLowerCase() === q),
      );
      return results.slice(0, 10).map((r) => ({
        ...r,
        event: memoryEvents.get(r.eventId) || DEFAULT_EVENT,
      }));
    }
    throw error;
  }
}
