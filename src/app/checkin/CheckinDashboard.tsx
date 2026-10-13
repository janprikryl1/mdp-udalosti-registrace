"use client";

import type { Event, Registration } from "@prisma/client";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { logoutOrganizerAction } from "@/app/actions/auth";
import {
  getCheckinStatsAction,
  revertCheckinAction,
  searchRegistrationsAction,
  verifyAndCheckinAction,
} from "@/app/actions/checkin";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CheckinStats, EventWithCounts } from "@/lib/registrations";
import {
  playErrorSound,
  playSuccessSound,
  playWarningSound,
} from "@/lib/sounds";
import { EventManagerModal } from "./EventManagerModal";
import { QrScanner } from "./QrScanner";

interface CheckinDashboardProps {
  initialStats?: CheckinStats;
  initialEvents?: EventWithCounts[];
}

type ScanStatus =
  | "SUCCESS"
  | "ALREADY_CHECKED_IN"
  | "WRONG_EVENT"
  | "NOT_FOUND"
  | null;

interface ActiveResult {
  status: ScanStatus;
  message: string;
  registration?: Registration & { event?: Event };
  cleanedCode?: string;
  timestamp: Date;
}

export function CheckinDashboard({
  initialStats,
  initialEvents = [],
}: CheckinDashboardProps) {
  const router = useRouter();

  // Events management state
  const [events, setEvents] = useState<EventWithCounts[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const firstActive = (initialEvents || []).find((e) => e.isActive);
    return firstActive ? firstActive.id : initialEvents?.[0]?.id || "";
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<
    "list" | "create" | "attendees"
  >("list");

  // Camera scanner enable/disable
  const [isScannerEnabled, setIsScannerEnabled] = useState(true);

  const openEventModal = useCallback(
    (tab: "list" | "create" | "attendees" = "list") => {
      setModalInitialTab(tab);
      setIsEventModalOpen(true);
    },
    [],
  );

  // Sound enable/disable
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Statistics
  const [stats, setStats] = useState<CheckinStats>(
    initialStats || {
      total: 0,
      attended: 0,
      remaining: 0,
      recentAttended: [],
    },
  );
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Active Scan/Checkin Result
  const [activeResult, setActiveResult] = useState<ActiveResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual code/email search
  const [manualInput, setManualInput] = useState("");
  const [_isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    (Registration & { event?: Event })[]
  >([]);

  // Revert action loading ID
  const [revertingId, setRevertingId] = useState<string | null>(null);

  // Active event object
  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Fetch updated stats for specific event or selected event
  const refreshStats = useCallback(
    async (targetId?: string) => {
      setIsRefreshingStats(true);
      try {
        const eventToQuery =
          targetId !== undefined ? targetId : selectedEventId;
        const res = await getCheckinStatsAction(eventToQuery || undefined);
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error("Stats refresh error:", err);
      } finally {
        setIsRefreshingStats(false);
      }
    },
    [selectedEventId],
  );

  useEffect(() => {
    if (!initialStats) {
      refreshStats();
    }
  }, [initialStats, refreshStats]);

  // Handle switching event
  const handleEventChange = (newId: string) => {
    setSelectedEventId(newId);
    setActiveResult(null);
    setManualInput("");
    setSearchResults([]);
    refreshStats(newId);
  };

  // Main check-in handler (triggered by camera scanner or manual button)
  const handleCheckin = async (rawCode: string, overrideEventId?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const eventToValidate =
        overrideEventId !== undefined ? overrideEventId : selectedEventId;
      const result = await verifyAndCheckinAction(
        rawCode,
        eventToValidate || undefined,
      );

      // Play audio feedback
      if (soundEnabled) {
        if (result.status === "SUCCESS") {
          playSuccessSound();
        } else if (
          result.status === "ALREADY_CHECKED_IN" ||
          result.status === "WRONG_EVENT"
        ) {
          playWarningSound();
        } else {
          playErrorSound();
        }
      }

      setActiveResult({
        status: result.status,
        message: result.message,
        registration: result.registration,
        cleanedCode: result.cleanedCode,
        timestamp: new Date(),
      });

      // Clear manual input and search results if any
      setManualInput("");
      setSearchResults([]);

      // Refresh stats in background
      refreshStats(selectedEventId);
    } catch {
      if (soundEnabled) playErrorSound();
      setActiveResult({
        status: "NOT_FOUND",
        message: "Chyba při komunikaci se serverem.",
        timestamp: new Date(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual search as user types
  const handleSearchChange = async (val: string) => {
    setManualInput(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await searchRegistrationsAction(
          val,
          selectedEventId || undefined,
        );
        if (res.success) {
          setSearchResults(res.results);
        }
      } catch {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Revert check-in
  const handleRevert = async (id: string) => {
    setRevertingId(id);
    try {
      const res = await revertCheckinAction(id);
      if (res.success) {
        if (activeResult?.registration?.id === id) {
          setActiveResult(null);
        }
        await refreshStats(selectedEventId);
      }
    } finally {
      setRevertingId(null);
    }
  };

  // Organizer Logout
  const handleLogout = async () => {
    await logoutOrganizerAction();
    router.refresh();
  };

  const attendancePercent =
    stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">
      {/* EVENT MANAGEMENT MODAL */}
      <EventManagerModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={(id) => handleEventChange(id)}
        onEventsUpdated={(updatedEvents) => {
          setEvents(updatedEvents);
          refreshStats(selectedEventId);
        }}
        initialTab={modalInitialTab}
        onCheckinAttendee={(code) => handleCheckin(code)}
      />

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Odbavovací terminál
            </h1>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span>Mládež děkanátu Prostějov</span>
            <span>•</span>
            <span className="font-semibold text-primary">
              {currentEvent ? currentEvent.title : "Všechny akce"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Attendees List Trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEventModal("attendees")}
            className="font-semibold"
            title="Zobrazit seznam zaregistrovaných účastníků"
          >
            <Users className="h-4 w-4 text-primary" />
            <span>Účastníci ({stats.total})</span>
          </Button>

          {/* Manage Events Modal Trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEventModal("list")}
            className="font-semibold"
            title="Spravovat a vytvářet události"
          >
            <Layers className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Správa akcí</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Sound Toggle */}
          <Button
            type="button"
            variant={soundEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Zvuk je zapnutý" : "Zvuk je ztlumený"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">
              {soundEnabled ? "Zvuk ZAP" : "Zvuk VYP"}
            </span>
          </Button>

          {/* Refresh Stats */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refreshStats(selectedEventId)}
            disabled={isRefreshingStats}
            title="Aktualizovat statistiky"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshingStats ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Obnovit</span>
          </Button>

          {/* Logout */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Odhlásit</span>
          </Button>
        </div>
      </div>

      {/* EVENT SELECTOR SWITCHER BAR */}
      <Card className="p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Skenuji pro akci:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="flex-1 rounded-xl border border-input bg-card py-1.5 px-3 text-sm font-semibold text-foreground shadow-sm focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="">-- Všechny události (bez filtru) --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} {ev.isActive ? "●" : "(pozastaveno)"} (
                  {ev.attendedCount ?? 0}/{ev.totalCount ?? 0} odbaveno)
                </option>
              ))}
            </select>
          </div>

          {currentEvent && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
              {currentEvent.location && (
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {currentEvent.location}
                </span>
              )}
              {currentEvent.date && (
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {new Intl.DateTimeFormat("cs-CZ", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(currentEvent.date))}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* STATS OVERVIEW BAR */}
      <Card className="p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <button
            type="button"
            onClick={() => openEventModal("attendees")}
            className="rounded-xl bg-muted/60 p-3 hover:bg-muted transition-colors text-center cursor-pointer"
            title="Zobrazit všechny registrované"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Registrováno
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.total}
            </p>
          </button>

          <button
            type="button"
            onClick={() => openEventModal("attendees")}
            className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-3 hover:bg-emerald-950/50 transition-colors text-center cursor-pointer"
            title="Zobrazit odbavené účastníky"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Odbaveno u vstupu
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats.attended}
            </p>
          </button>

          <div className="rounded-xl bg-muted/60 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Zbývá dorazit
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-muted-foreground">
              {stats.remaining}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
            <span>Účast {stats.eventName ? `(${stats.eventName})` : ""}</span>
            <span>{attendancePercent} %</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* ACTIVE SCAN RESULT BANNER (HUGE VISUAL FEEDBACK) */}
      {activeResult && (
        <div
          className={`animate-in zoom-in-95 duration-200 rounded-3xl p-6 sm:p-8 text-center shadow-xl border-4 ${
            activeResult.status === "SUCCESS"
              ? "border-emerald-500 bg-emerald-600 text-white"
              : activeResult.status === "ALREADY_CHECKED_IN"
                ? "border-rose-600 bg-rose-600 text-white"
                : activeResult.status === "WRONG_EVENT"
                  ? "border-amber-400 bg-amber-600 text-white"
                  : "border-amber-400 bg-amber-500 text-white"
          }`}
        >
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-4">
            {activeResult.status === "SUCCESS" && (
              <CheckCircle2 className="h-14 w-14 text-white" />
            )}
            {activeResult.status === "ALREADY_CHECKED_IN" && (
              <AlertTriangle className="h-14 w-14 text-white animate-bounce" />
            )}
            {activeResult.status === "WRONG_EVENT" && (
              <AlertTriangle className="h-14 w-14 text-white animate-bounce" />
            )}
            {activeResult.status === "NOT_FOUND" && (
              <HelpCircle className="h-14 w-14 text-white" />
            )}
          </div>

          {/* Title & Message */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {activeResult.status === "SUCCESS" &&
              "PLATNÁ REGISTRACE • VSTUP POVOLEN"}
            {activeResult.status === "ALREADY_CHECKED_IN" &&
              "POZOR: JIŽ UPLATNĚNO"}
            {activeResult.status === "WRONG_EVENT" &&
              "POZOR: KÓD PRO JINOU UDÁLOST"}
            {activeResult.status === "NOT_FOUND" && "NENALEZENO / NEPLATNÝ KÓD"}
          </h2>

          <p className="mt-2 text-base sm:text-lg font-medium text-white/95 max-w-xl mx-auto">
            {activeResult.message}
          </p>

          {/* Participant Details Card if available */}
          {activeResult.registration && (
            <div className="mx-auto mt-4 max-w-md rounded-2xl bg-white/15 p-4 backdrop-blur-md text-left text-sm text-white">
              <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
                <span className="font-bold text-lg">
                  {activeResult.registration.firstName}{" "}
                  {activeResult.registration.lastName}
                </span>
                <span className="rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold">
                  {activeResult.registration.city}
                </span>
              </div>
              <p className="text-xs text-white/80">
                E-mail: {activeResult.registration.email}
              </p>
              {activeResult.registration.event && (
                <p className="text-xs text-white/90 font-semibold mt-1">
                  Událost: {activeResult.registration.event.title}
                </p>
              )}
              <p className="text-[11px] text-white/70 font-mono mt-0.5">
                ID: {activeResult.registration.id}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold shadow-lg"
              onClick={() => setActiveResult(null)}
            >
              <span>Skenovat dalšího</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* If wrong event was scanned, allow fast switch & check-in */}
            {activeResult.status === "WRONG_EVENT" &&
              activeResult.registration?.eventId && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const reg = activeResult.registration;
                    if (reg) {
                      handleEventChange(reg.eventId);
                      handleCheckin(reg.id, reg.eventId);
                    }
                  }}
                  className="bg-amber-950/60 hover:bg-amber-950/80 text-white font-extrabold border border-white/30"
                >
                  <span>Přepnout na tuto akci a odbavit</span>
                </Button>
              )}

            {/* If warning or mistakenly checked in, option to undo */}
            {activeResult.status === "ALREADY_CHECKED_IN" &&
              activeResult.registration && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    if (activeResult.registration) {
                      handleRevert(activeResult.registration.id);
                    }
                  }}
                  disabled={revertingId === activeResult.registration.id}
                  className="text-white hover:bg-black/20"
                >
                  <Undo2 className="h-4 w-4" />
                  <span>Stornovat toto odbavení</span>
                </Button>
              )}
          </div>
        </div>
      )}

      {/* SCANNER & MANUAL ENTRY SECTION */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
        {/* CAMERA SCANNER */}
        <Card className="p-5 sm:p-6 shadow-sm text-center">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Kamerový skener
            </h2>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Ověřuji...
                </span>
              )}
              <Button
                type="button"
                variant={isScannerEnabled ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsScannerEnabled(!isScannerEnabled)}
                title={
                  isScannerEnabled
                    ? "Vypnout kameru (šetří baterii zařízení)"
                    : "Zapnout kameru"
                }
                className="h-7 px-2.5 text-xs font-semibold"
              >
                {isScannerEnabled ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                    <span>Vypnout skener</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5 text-primary mr-1" />
                    <span>Zapnout skener</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {isScannerEnabled ? (
            <QrScanner
              onScan={(code) => handleCheckin(code)}
              isPaused={isProcessing || activeResult !== null}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-2xl bg-muted/20 text-center space-y-3 min-h-[260px]">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CameraOff className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Kamerový skener je vypnutý
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Kamera je odpojena a nečerpá baterii zařízení. Kód můžete
                  zadat ručně vpravo nebo kameru znovu zapnout.
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setIsScannerEnabled(true)}
                className="mt-2"
              >
                <Camera className="h-4 w-4 mr-1.5" />
                <span>Zapnout kameru</span>
              </Button>
            </div>
          )}
        </Card>

        {/* BACKUP MANUAL ENTRY & SEARCH */}
        <Card className="p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Záložní ruční odbavení
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pokud účastníkovi nejde načíst displej, zadej jeho e-mail, jméno
              nebo ID.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) {
                handleCheckin(manualInput.trim());
              }
            }}
            className="space-y-3"
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input
                type="text"
                placeholder="Zadej jméno, e-mail nebo ID..."
                value={manualInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isProcessing}
                className="pl-10 pr-9"
              />
              {manualInput && (
                <button
                  type="button"
                  onClick={() => {
                    setManualInput("");
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              disabled={isProcessing || !manualInput.trim()}
              className="w-full font-bold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ověřuji kód...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Odbavit zadaný údaj</span>
                </>
              )}
            </Button>
          </form>

          {/* Search suggestions dropdown */}
          {searchResults.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Nalezení účastníci v databázi:
              </p>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {searchResults.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/60 p-2.5 text-xs hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        {reg.firstName} {reg.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {reg.city} • {reg.email}
                      </p>
                      {reg.event && !selectedEventId && (
                        <p className="text-[10px] text-primary font-medium">
                          Akce: {reg.event.title}
                        </p>
                      )}
                    </div>

                    <div>
                      {reg.status === "ATTENDED" ? (
                        <Badge variant="success">Odbaven</Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() => handleCheckin(reg.id)}
                          disabled={isProcessing}
                        >
                          Odbavit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RECENT CHECK-INS ACTIVITY */}
      <Card className="p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Poslední odbavení účastníci
          </h2>
          <span className="text-xs text-muted-foreground">
            {stats.recentAttended.length} zobrazeno
          </span>
        </div>

        {stats.recentAttended.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Zatím nebyl odbaven žádný účastník.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentAttended.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between py-2.5 text-xs text-foreground hover:bg-muted/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {att.firstName} {att.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span>{att.city}</span>
                      <span>•</span>
                      <span>
                        {att.attendedAt
                          ? new Intl.DateTimeFormat("cs-CZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }).format(new Date(att.attendedAt))
                          : ""}
                      </span>
                      {att.event && !selectedEventId && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {att.event.title}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevert(att.id)}
                  disabled={revertingId === att.id}
                  className="hover:bg-destructive/20 hover:text-rose-400 hover:border-destructive/40"
                  title="Stornovat odbavení"
                >
                  <Undo2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Vrátit</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
