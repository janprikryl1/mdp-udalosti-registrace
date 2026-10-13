"use client";

import type { Event, Registration } from "@prisma/client";
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Power,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createEventAction,
  deleteAttendeeAction,
  deleteEventAction,
  getEventAttendeesAction,
  getEventsAction,
  toggleEventActiveAction,
} from "@/app/actions/events";
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
  initialTab?: "list" | "create" | "attendees";
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
  const [activeTab, setActiveTab] = useState<"list" | "create" | "attendees">(
    initialTab,
  );
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

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAttendeeFilterEventId(selectedEventId || "");
    }
  }, [isOpen, initialTab, selectedEventId]);

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
                          className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 hover:text-orange-300"
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
