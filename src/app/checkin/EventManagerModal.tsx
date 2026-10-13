"use client";

import {
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Power,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  createEventAction,
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
}

export function EventManagerModal({
  isOpen,
  onClose,
  events,
  selectedEventId,
  onSelectEvent,
  onEventsUpdated,
}: EventManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-card shadow-2xl border border-border overflow-hidden my-8 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Správa událostí a akcí
            </h2>
            <p className="text-xs text-muted-foreground">
              Vytvářej nové akce, přepínej aktivitu a kontroluj účast.
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
        <div className="flex border-b border-border px-6 pt-3 gap-3 bg-card">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "list"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Přehled událostí ({events.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>+ Vytvořit novou událost</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
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
                          <div className="flex items-center gap-2">
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

                        {/* Counts Badge */}
                        <div className="text-right">
                          <div className="rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
                            <span className="text-emerald-400 font-extrabold">
                              {attended}
                            </span>{" "}
                            / {total} odbaveno
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
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
