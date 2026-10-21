"use client";

import type { Event, Registration } from "@prisma/client";
import {
  Armchair,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Power,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createEventAction,
  deleteAttendeeAction,
  deleteEventAction,
  getEventAttendeesAction,
  getEventsAction,
  getEventTableAssignmentsAction,
  toggleEventActiveAction,
  updateEventTableCountAction,
} from "@/app/actions/events";
import {
  type AdminSeatAssignment,
  SeatingMap,
} from "@/components/seating/SeatingMap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EventWithCounts } from "@/lib/registrations";

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventWithCounts[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onEventsUpdated: (events: EventWithCounts[]) => void;
  initialTab?: "list" | "create" | "attendees" | "tables";
  onCheckinAttendee?: (code: string) => void;
}

export function EventManagerModal({
  isOpen,
  onClose,
  events,
  selectedEventId,
  onSelectEvent,
  onEventsUpdated,
  initialTab = "list",
  onCheckinAttendee,
}: EventManagerModalProps) {
  const [activeTab, setActiveTab] = useState<
    "list" | "create" | "attendees" | "tables"
  >(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deletingAttendeeId, setDeletingAttendeeId] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Attendees tab state
  const [attendees, setAttendees] = useState<
    (Registration & { event?: Event })[]
  >([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [attendeeFilterEventId, setAttendeeFilterEventId] = useState<string>(
    selectedEventId || "",
  );
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<
    "ALL" | "REGISTERED" | "ATTENDED"
  >("ALL");
  const [copiedAttendees, setCopiedAttendees] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tableCountFormInput, setTableCountFormInput] = useState<number>(6);

  // Table Seating tab state
  const [tableAssignments, setTableAssignments] = useState<
    AdminSeatAssignment[]
  >([]);
  const [adminTableCount, setAdminTableCount] = useState<number>(6);
  const [adminSeatsPerTable, setAdminSeatsPerTable] = useState<number>(8);
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(false);
  const [isUpdatingTableCount, setIsUpdatingTableCount] =
    useState<boolean>(false);
  const [tableFilterEventId, setTableFilterEventId] = useState<string>(
    selectedEventId || "",
  );
  const [tableNumberFilter, setTableNumberFilter] = useState<string>("ALL");
  const [tableSearchQuery, setTableSearchQuery] = useState<string>("");

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAttendeeFilterEventId(selectedEventId || "");
      setTableFilterEventId(selectedEventId || "");
    }
  }, [isOpen, initialTab, selectedEventId]);

  const loadTableData = useCallback(async (eventId?: string) => {
    setIsLoadingTables(true);
    try {
      const res = await getEventTableAssignmentsAction(eventId);
      if (res.success) {
        setTableAssignments(res.assignments as AdminSeatAssignment[]);
        setAdminTableCount(res.tableCount);
        setAdminSeatsPerTable(res.seatsPerTable);
      }
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  // Load table data when tab switches to 'tables' or filter changes
  useEffect(() => {
    if (isOpen && activeTab === "tables") {
      loadTableData(tableFilterEventId || undefined);
    }
  }, [isOpen, activeTab, tableFilterEventId, loadTableData]);

  // Load attendees when tab switches to 'attendees' or filter changes
  useEffect(() => {
    if (isOpen && activeTab === "attendees") {
      setIsLoadingAttendees(true);
      getEventAttendeesAction(attendeeFilterEventId || undefined)
        .then((res) => {
          if (res.success && res.attendees) {
            setAttendees(res.attendees);
          }
        })
        .finally(() => {
          setIsLoadingAttendees(false);
        });
    }
  }, [isOpen, activeTab, attendeeFilterEventId]);

  if (!isOpen) return null;

  const refreshEventsList = async () => {
    const res = await getEventsAction();
    if (res.success && res.events) {
      onEventsUpdated(res.events);
    }
  };

  const handleUpdateTableCountForEvent = async (
    eventId: string,
    newCount: number,
  ) => {
    if (!eventId || newCount < 1 || newCount > 50) return;
    setIsUpdatingTableCount(true);
    try {
      const res = await updateEventTableCountAction(eventId, newCount);
      if (res.success && res.event) {
        if (eventId === tableFilterEventId) {
          setAdminTableCount(res.event.tableCount);
        }
        await refreshEventsList();
      }
    } finally {
      setIsUpdatingTableCount(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await toggleEventActiveAction(id);
      if (res.success) {
        await refreshEventsList();
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteEvent = async (id: string, evTitle: string) => {
    const confirmed = window.confirm(
      `Opravdu chcete smazat událost "${evTitle}"?\n\nVšechny dosavadní registrace k této akci budou nenávratně odstraněny!`,
    );
    if (!confirmed) return;

    setDeletingEventId(id);
    try {
      const res = await deleteEventAction(id);
      if (res.success) {
        if (selectedEventId === id) {
          const remaining = events.filter((e) => e.id !== id);
          onSelectEvent(remaining[0]?.id || "");
        }
        await refreshEventsList();
      } else {
        alert(res.error || "Nepodařilo se smazat událost");
      }
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleDeleteAttendee = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Opravdu chcete odstranit registraci účastníka "${name}"?`,
    );
    if (!confirmed) return;

    setDeletingAttendeeId(id);
    try {
      const res = await deleteAttendeeAction(id);
      if (res.success) {
        setAttendees((prev) => prev.filter((a) => a.id !== id));
        await refreshEventsList();
      } else {
        alert(res.error || "Nepodařilo se smazat registraci");
      }
    } finally {
      setDeletingAttendeeId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim()) {
      setFormError("Zadejte název události");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createEventAction({
        title: title.trim(),
        slug: slug.trim() || undefined,
        date: date.trim() || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        tableCount: tableCountFormInput || 6,
        isActive: true,
      });

      if (!res.success || !res.event) {
        setFormError(res.error || "Nepodařilo se vytvořit událost");
        setIsSubmitting(false);
        return;
      }

      setFormSuccess(`Událost "${res.event.title}" byla úspěšně vytvořena!`);
      setTitle("");
      setSlug("");
      setDate("");
      setLocation("");
      setDescription("");
      setTableCountFormInput(6);

      // Refresh list and select new event
      await refreshEventsList();
      onSelectEvent(res.event.id);
      setActiveTab("list");
    } catch {
      setFormError("Došlo k chybě při komunikaci se serverem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    if (attendeeStatusFilter !== "ALL" && a.status !== attendeeStatusFilter) {
      return false;
    }
    if (attendeeSearchQuery.trim()) {
      const q = attendeeSearchQuery.toLowerCase().trim();
      const matchName = `${a.firstName} ${a.lastName}`
        .toLowerCase()
        .includes(q);
      const matchEmail = a.email.toLowerCase().includes(q);
      const matchCity = a.city.toLowerCase().includes(q);
      const matchId = a.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchCity || matchId;
    }
    return true;
  });

  const exportAttendeesCsv = () => {
    const rows = filteredAttendees.map(
      (a) =>
        `"${a.firstName} ${a.lastName}","${a.email}","${a.city}","${a.event?.title || ""}","${a.status === "ATTENDED" ? "Odbaven" : "Registrován"}","${a.attendedAt ? new Intl.DateTimeFormat("cs-CZ", { dateStyle: "short", timeStyle: "medium" }).format(new Date(a.attendedAt)) : ""}","${a.id}"`,
    );
    const header = `"Jméno a Příjmení","E-mail","Město","Událost","Stav","Čas odbavení","ID"`;
    const csv = [header, ...rows].join("\n");
    navigator.clipboard.writeText(csv);
    setCopiedAttendees(true);
    setTimeout(() => setCopiedAttendees(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-card shadow-2xl border border-border overflow-hidden my-6 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/40 sm:px-6">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Správa akcí a účastníků
            </h2>
            <p className="text-xs text-muted-foreground">
              Vytvářej akce, kontroluj seznamy přihlášených a spravuj účastníky.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-border px-5 pt-3 gap-2 sm:gap-3 bg-card sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "list"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Přehled událostí ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attendees")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "attendees"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Seznam účastníků</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tables")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "tables"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Armchair className="h-4 w-4" />
            <span>Zasedací pořádek & Stoly</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>+ Vytvořit novou událost</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: LIST OF EVENTS */}
          {activeTab === "list" && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  Zatím nemáte vytvořené žádné události.
                </p>
              ) : (
                events.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  const total = ev.totalCount ?? 0;
                  const attended = ev.attendedCount ?? 0;

                  return (
                    <Card
                      key={ev.id}
                      className={`p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base text-foreground">
                              {ev.title}
                            </h3>
                            {ev.isActive ? (
                              <Badge variant="success">Aktivní</Badge>
                            ) : (
                              <Badge variant="secondary">Pozastaveno</Badge>
                            )}
                            {isSelected && (
                              <Badge variant="brand" className="font-semibold">
                                <Check className="h-3 w-3 mr-1" />
                                Vybráno pro skenování
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                {ev.location}
                              </span>
                            )}
                            {ev.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Intl.DateTimeFormat("cs-CZ", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(ev.date))}
                              </span>
                            )}
                            <span className="font-mono text-muted-foreground">
                              slug: {ev.slug}
                            </span>
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs text-foreground">
                              <Armchair className="h-3.5 w-3.5 text-primary" />
                              <span>
                                Stoly: <strong>{ev.tableCount || 6}</strong> (
                                {(ev.tableCount || 6) * 8} míst)
                              </span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  disabled={
                                    isUpdatingTableCount ||
                                    (ev.tableCount || 6) <= 2
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateTableCountForEvent(
                                      ev.id,
                                      (ev.tableCount || 6) - 1,
                                    );
                                  }}
                                  className="h-4 w-4 rounded-xs border border-primary/40 bg-card flex items-center justify-center text-[10px] font-bold hover:border-primary disabled:opacity-40 cursor-pointer"
                                  title="Odebrat 1 stůl"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    isUpdatingTableCount ||
                                    (ev.tableCount || 6) >= 40
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateTableCountForEvent(
                                      ev.id,
                                      (ev.tableCount || 6) + 1,
                                    );
                                  }}
                                  className="h-4 w-4 rounded-xs border border-primary/40 bg-card flex items-center justify-center text-[10px] font-bold hover:border-primary disabled:opacity-40 cursor-pointer"
                                  title="Zvýšit počet stolů"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {ev.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        {/* Counts Badge & Attendees trigger */}
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAttendeeFilterEventId(ev.id);
                              setActiveTab("attendees");
                            }}
                            className="rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors block cursor-pointer"
                            title="Zobrazit účastníky této akce"
                          >
                            <span className="text-emerald-400 font-extrabold">
                              {attended}
                            </span>{" "}
                            / {total} odbaveno (zobrazit)
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isSelected && (
                            <Button
                              type="button"
                              size="sm"
                              variant="default"
                              onClick={() => {
                                onSelectEvent(ev.id);
                                onClose();
                              }}
                            >
                              Skenovat tuto akci
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAttendeeFilterEventId(ev.id);
                              setActiveTab("attendees");
                            }}
                          >
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>Účastníci ({total})</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTableFilterEventId(ev.id);
                              setActiveTab("tables");
                            }}
                          >
                            <Armchair className="h-3.5 w-3.5 mr-1 text-primary" />
                            <span>Stoly ({ev.tableCount || 6})</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(ev.id)}
                            disabled={togglingId === ev.id}
                            title={
                              ev.isActive
                                ? "Pozastavit registraci"
                                : "Aktivovat registraci"
                            }
                          >
                            {togglingId === ev.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {ev.isActive ? "Pozastavit" : "Aktivovat"}
                            </span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            disabled={deletingEventId === ev.id}
                            className="hover:bg-destructive/20 hover:text-rose-400 text-muted-foreground"
                            title="Smazat tuto událost"
                          >
                            {deletingEventId === ev.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Smazat</span>
                          </Button>
                        </div>

                        <Link
                          href={`/registrace?event=${encodeURIComponent(ev.slug)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-accent"
                        >
                          <span>Veřejná registrace</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ATTENDEES LIST */}
          {activeTab === "attendees" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                  {/* Event Filter */}
                  <select
                    value={attendeeFilterEventId}
                    onChange={(e) => setAttendeeFilterEventId(e.target.value)}
                    className="rounded-xl border border-input bg-card py-1.5 px-3 text-xs font-semibold text-foreground focus:border-ring focus:outline-hidden"
                  >
                    <option value="">-- Všechny akce --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.totalCount ?? 0})
                      </option>
                    ))}
                  </select>

                  {/* Search query */}
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Hledat jméno, e-mail, město..."
                      value={attendeeSearchQuery}
                      onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setAttendeeStatusFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        attendeeStatusFilter === "ALL"
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Všichni
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendeeStatusFilter("ATTENDED")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        attendeeStatusFilter === "ATTENDED"
                          ? "bg-emerald-600 text-white font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Odbaveni
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendeeStatusFilter("REGISTERED")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        attendeeStatusFilter === "REGISTERED"
                          ? "bg-muted text-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Čekající
                    </button>
                  </div>
                </div>

                {/* Export button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportAttendeesCsv}
                  disabled={filteredAttendees.length === 0}
                  className="whitespace-nowrap"
                  title="Kopírovat seznam účastníků jako CSV text do schránky"
                >
                  {copiedAttendees ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  <span>
                    {copiedAttendees ? "Zkopírováno!" : "Kopírovat CSV"}
                  </span>
                </Button>
              </div>

              {/* Status summary */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Nalezeno: <strong>{filteredAttendees.length}</strong>{" "}
                  účastníků (
                  {
                    filteredAttendees.filter((a) => a.status === "ATTENDED")
                      .length
                  }{" "}
                  odbaveno)
                </span>
                <span className="font-mono text-[11px]">
                  Řazeno od nejnovějších
                </span>
              </div>

              {/* Loading indicator */}
              {isLoadingAttendees && (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Načítám seznam účastníků...</span>
                </div>
              )}

              {/* Attendees list */}
              {!isLoadingAttendees && filteredAttendees.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/20">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">
                    Žádní účastníci neodpovídají zadanému filtru.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zkuste změnit výběr akce nebo hledaný výraz.
                  </p>
                </div>
              )}

              {!isLoadingAttendees && filteredAttendees.length > 0 && (
                <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                  {filteredAttendees.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/30 transition-colors text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground">
                            {att.firstName} {att.lastName}
                          </span>
                          {att.status === "ATTENDED" ? (
                            <Badge variant="success">Odbaven</Badge>
                          ) : (
                            <Badge variant="secondary">Čeká na příchod</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                          <span>{att.email}</span>
                          <span>•</span>
                          <span>{att.city}</span>
                          {att.event && !attendeeFilterEventId && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-medium">
                                {att.event.title}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-[11px]">
                            Reg:{" "}
                            {new Intl.DateTimeFormat("cs-CZ", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(att.createdAt))}
                          </span>
                          {att.attendedAt && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">
                                Vstup:{" "}
                                {new Intl.DateTimeFormat("cs-CZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(att.attendedAt))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {att.status === "REGISTERED" && onCheckinAttendee && (
                          <Button
                            type="button"
                            size="sm"
                            variant="brand"
                            onClick={() => {
                              onCheckinAttendee(att.id);
                              onClose();
                            }}
                          >
                            Odbavit nyní
                          </Button>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteAttendee(
                              att.id,
                              `${att.firstName} ${att.lastName}`,
                            )
                          }
                          disabled={deletingAttendeeId === att.id}
                          className="hover:bg-destructive/20 hover:text-rose-400 text-muted-foreground"
                          title="Smazat účastníka"
                        >
                          {deletingAttendeeId === att.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TABLES & SEATING MAP */}
          {activeTab === "tables" && (
            <div className="space-y-5">
              {/* Event selection & Table count controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card/70 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label
                      htmlFor="table-event-select"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Vybraná akce:
                    </label>
                    <select
                      id="table-event-select"
                      value={tableFilterEventId}
                      onChange={(e) => setTableFilterEventId(e.target.value)}
                      className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}{" "}
                          {ev.id === selectedEventId ? "(aktuální)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table count adjuster */}
                <div className="flex flex-wrap items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-2.5">
                  <div className="text-right">
                    <span className="block text-[10px] font-heading uppercase font-bold text-primary">
                      Nastavení kapacity
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Počet stolů pro tuto akci:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/90 rounded-lg border border-primary/40 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={adminTableCount <= 2 || isUpdatingTableCount}
                      onClick={() =>
                        handleUpdateTableCountForEvent(
                          tableFilterEventId || selectedEventId,
                          adminTableCount - 1,
                        )
                      }
                      className="h-7 w-7 p-0 text-foreground hover:text-primary font-bold"
                      title="Odebrat 1 stůl"
                    >
                      -
                    </Button>
                    <span className="px-2 font-heading text-sm font-bold text-foreground lining-nums">
                      {adminTableCount}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={adminTableCount >= 40 || isUpdatingTableCount}
                      onClick={() =>
                        handleUpdateTableCountForEvent(
                          tableFilterEventId || selectedEventId,
                          adminTableCount + 1,
                        )
                      }
                      className="h-7 w-7 p-0 text-foreground hover:text-primary font-bold"
                      title="Zvýšit počet stolů"
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-xs font-semibold text-foreground lining-nums">
                    ({adminTableCount * adminSeatsPerTable} míst)
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      loadTableData(tableFilterEventId || undefined)
                    }
                    disabled={isLoadingTables}
                    className="h-8 text-xs text-muted-foreground hover:text-primary"
                    title="Aktualizovat data"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isLoadingTables ? "animate-spin text-primary" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              {/* Statistics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 border-primary/25 bg-card/60 text-center">
                  <span className="block text-[10px] font-heading font-semibold uppercase text-muted-foreground">
                    Celkem stolů
                  </span>
                  <span className="text-xl font-extrabold text-foreground lining-nums">
                    {adminTableCount}
                  </span>
                </Card>

                <Card className="p-3 border-primary/25 bg-card/60 text-center">
                  <span className="block text-[10px] font-heading font-semibold uppercase text-muted-foreground">
                    Celková místa
                  </span>
                  <span className="text-xl font-extrabold text-foreground lining-nums">
                    {adminTableCount * adminSeatsPerTable}
                  </span>
                </Card>

                <Card className="p-3 border-primary/25 bg-card/60 text-center">
                  <span className="block text-[10px] font-heading font-semibold uppercase text-muted-foreground">
                    Zarezervováno
                  </span>
                  <span className="text-xl font-extrabold text-primary lining-nums">
                    {tableAssignments.length}
                  </span>
                </Card>

                <Card className="p-3 border-primary/25 bg-card/60 text-center">
                  <span className="block text-[10px] font-heading font-semibold uppercase text-muted-foreground">
                    Volných míst
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400 lining-nums">
                    {Math.max(
                      0,
                      adminTableCount * adminSeatsPerTable -
                        tableAssignments.length,
                    )}
                  </span>
                </Card>
              </div>

              {/* Interactive Hall Seating Map */}
              {isLoadingTables ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Načítám zasedací pořádek sálu...
                  </span>
                </div>
              ) : (
                <SeatingMap
                  tableCount={adminTableCount}
                  seatsPerTable={adminSeatsPerTable}
                  reservedSeats={tableAssignments.map((a) => ({
                    tableNumber: a.tableNumber,
                    seatNumber: a.seatNumber,
                  }))}
                  adminAssignments={tableAssignments}
                  isAdminView={true}
                  onTableCountChange={(newCount) =>
                    handleUpdateTableCountForEvent(
                      tableFilterEventId || selectedEventId,
                      newCount,
                    )
                  }
                  isUpdatingTableCount={isUpdatingTableCount}
                />
              )}

              {/* Table assignments list with filter */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Armchair className="h-4 w-4 text-primary" />
                    <span>
                      Seznam rezervací u stolů ({tableAssignments.length})
                    </span>
                  </h3>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Hledat jméno / email..."
                        value={tableSearchQuery}
                        onChange={(e) => setTableSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs w-44"
                      />
                    </div>

                    <select
                      value={tableNumberFilter}
                      onChange={(e) => setTableNumberFilter(e.target.value)}
                      className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs text-foreground h-8"
                    >
                      <option value="ALL">Všechny stoly</option>
                      {Array.from(
                        { length: adminTableCount },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <option key={num} value={num.toString()}>
                          Stůl {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* List items */}
                <div className="space-y-2">
                  {tableAssignments
                    .filter((a) => {
                      if (
                        tableNumberFilter !== "ALL" &&
                        a.tableNumber.toString() !== tableNumberFilter
                      ) {
                        return false;
                      }
                      if (tableSearchQuery.trim()) {
                        const q = tableSearchQuery.toLowerCase();
                        const fullName =
                          `${a.registration.firstName} ${a.registration.lastName}`.toLowerCase();
                        return (
                          fullName.includes(q) ||
                          a.registration.email.toLowerCase().includes(q) ||
                          a.registration.city.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .sort((a, b) => {
                      if (a.tableNumber !== b.tableNumber) {
                        return a.tableNumber - b.tableNumber;
                      }
                      return a.seatNumber - b.seatNumber;
                    })
                    .map((item) => (
                      <div
                        key={`${item.tableNumber}-${item.seatNumber}-${item.registration.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 text-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant="brand"
                            className="font-heading font-bold"
                          >
                            Stůl {item.tableNumber} • Místo {item.seatNumber}
                          </Badge>
                          <span className="font-bold text-foreground text-sm">
                            {item.registration.firstName}{" "}
                            {item.registration.lastName}
                          </span>
                          <span className="text-muted-foreground">
                            {item.registration.city}
                          </span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="text-muted-foreground">
                            {item.registration.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.registration.status === "ATTENDED" ? (
                            <Badge variant="success">Odbaven</Badge>
                          ) : (
                            <Badge variant="secondary">Čeká na příchod</Badge>
                          )}

                          {item.registration.status === "REGISTERED" &&
                            onCheckinAttendee && (
                              <Button
                                type="button"
                                size="sm"
                                variant="brand"
                                onClick={() => {
                                  onCheckinAttendee(item.registration.id);
                                  onClose();
                                }}
                                className="h-7 text-xs px-2.5"
                              >
                                Odbavit
                              </Button>
                            )}
                        </div>
                      </div>
                    ))}

                  {tableAssignments.length === 0 && (
                    <p className="text-center py-6 text-xs text-muted-foreground">
                      Zatím si nikdo nezarezervoval místo u stolu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE EVENT */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              {formSuccess && (
                <Alert variant="success">
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              )}

              <div>
                <label
                  htmlFor="event-title"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                >
                  Název události *
                </label>
                <Input
                  id="event-title"
                  type="text"
                  placeholder="např. Diecézní setkání mládeže 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-slug"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                  >
                    URL identifikátor (slug)
                  </label>
                  <Input
                    id="event-slug"
                    type="text"
                    placeholder="např. dsm-2026 (nepovinné)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Pokud nevyplníte, vygeneruje se automaticky z názvu.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="event-date"
                    className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                  >
                    Datum a čas konání
                  </label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-location"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                >
                  Místo konání
                </label>
                <Input
                  id="event-location"
                  type="text"
                  placeholder="např. Farní sál u Povýšení sv. Kříže, Prostějov"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="event-tables"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                >
                  Počet stolů k rezervaci (každý stůl má 8 míst)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="event-tables"
                    type="number"
                    min={1}
                    max={50}
                    value={tableCountFormInput}
                    onChange={(e) =>
                      setTableCountFormInput(
                        Math.max(
                          1,
                          Math.min(50, parseInt(e.target.value, 10) || 6),
                        ),
                      )
                    }
                    disabled={isSubmitting}
                    className="w-32"
                  />
                  <span className="text-xs text-muted-foreground">
                    Celková kapacita:{" "}
                    <strong className="text-foreground">
                      {tableCountFormInput * 8}
                    </strong>{" "}
                    míst k sezení
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
                >
                  Popis akce
                </label>
                <textarea
                  id="event-desc"
                  rows={3}
                  placeholder="Bližší informace o programu a pokyny pro účastníky..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("list")}
                  disabled={isSubmitting}
                >
                  Zpět na přehled
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Vytvářím událost...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Uložit a aktivovat událost</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
