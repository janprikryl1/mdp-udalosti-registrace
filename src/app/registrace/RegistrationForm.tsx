"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Armchair,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  getTableStatusAction,
  registerParticipantAction,
} from "@/app/actions/registration";
import { type ReservedSeat, SeatingMap } from "@/components/seating/SeatingMap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventWithCounts } from "@/lib/registrations";
import {
  type RegistrationFormData,
  registrationFormSchema,
} from "@/lib/validations";

interface RegistrationFormProps {
  events?: EventWithCounts[];
  defaultEventId?: string;
}

export function RegistrationForm({
  events = [],
  defaultEventId,
}: RegistrationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected event
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (defaultEventId) return defaultEventId;
    return events[0]?.id || "";
  });

  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Table reservation state
  const [tableCount, setTableCount] = useState<number>(6);
  const [seatsPerTable, setSeatsPerTable] = useState<number>(8);
  const [reservedSeats, setReservedSeats] = useState<ReservedSeat[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(
    null,
  );
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(
    null,
  );
  const [showSeatingMap, setShowSeatingMap] = useState<boolean>(true);

  // GDPR details modal/toggle
  const [showGdprDetails, setShowGdprDetails] = useState<boolean>(false);

  const fetchTableStatus = useCallback(async (eventId?: string) => {
    setIsLoadingTables(true);
    try {
      const res = await getTableStatusAction(eventId);
      if (res.success && res.data) {
        setTableCount(res.data.tableCount);
        setSeatsPerTable(res.data.seatsPerTable);
        setReservedSeats(res.data.reservedSeats);
      }
    } catch (err) {
      console.error("Failed to load table reservations:", err);
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchTableStatus(selectedEventId);
  }, [selectedEventId, fetchTableStatus]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(
      registrationFormSchema,
    ) as Resolver<RegistrationFormData>,
    defaultValues: {
      eventId: selectedEventId,
      firstName: "",
      lastName: "",
      email: "",
      city: "",
      tableNumber: null,
      seatNumber: null,
      consent: false,
    },
  });

  // Keep form value in sync with visual table seat selection
  const handleSeatSelect = (
    tableNumber: number | null,
    seatNumber: number | null,
  ) => {
    setSelectedTableNumber(tableNumber);
    setSelectedSeatNumber(seatNumber);
    setValue("tableNumber", tableNumber);
    setValue("seatNumber", seatNumber);
  };

  const onSubmit = async (values: RegistrationFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await registerParticipantAction({
        ...values,
        eventId: selectedEventId || undefined,
        tableNumber: selectedTableNumber,
        seatNumber: selectedSeatNumber,
      });

      if (!result.success || !result.registrationId) {
        setServerError(
          result.error ||
            "Při registraci došlo k chybě. Zkuste to prosím znovu.",
        );
        setIsSubmitting(false);
        // Refresh tables in case seat was taken by someone else
        fetchTableStatus(selectedEventId);
        return;
      }

      // Redirect to success page with registration ID
      router.push(
        `/registrace/uspech?id=${encodeURIComponent(result.registrationId)}`,
      );
    } catch (_err) {
      setServerError(
        "Nepodařilo se navázat spojení se serverem. Zkontrolujte připojení k internetu.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-body">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chyba registrace</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Event selection if multiple active events are available */}
      {events.length > 1 && (
        <div className="rounded-xl border border-primary/25 bg-card/60 p-4 space-y-2">
          <label
            htmlFor="event-select"
            className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground"
          >
            Vyber událost, na kterou se hlásíš *
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSelectedTableNumber(null);
              setSelectedSeatNumber(null);
              setValue("tableNumber", null);
              setValue("seatNumber", null);
            }}
            disabled={isSubmitting}
            className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-xs focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} {ev.location ? `— ${ev.location}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Event details summary badge */}
      {currentEvent && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-xs text-muted-foreground">
          <span className="font-heading text-sm font-semibold text-foreground">
            {currentEvent.title}
          </span>
          {currentEvent.date && (
            <span className="flex items-center gap-1 lining-nums">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {new Intl.DateTimeFormat("cs-CZ", {
                dateStyle: "long",
              }).format(new Date(currentEvent.date))}
            </span>
          )}
          {currentEvent.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {currentEvent.location}
            </span>
          )}
        </div>
      )}

      {/* 1. SECTION: Personal Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-primary/25 pb-2">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
            1. Osobní údaje
          </h2>
        </div>

        {/* Name and Surname row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Jméno *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="firstName"
                type="text"
                placeholder="např. Tomáš"
                disabled={isSubmitting}
                className={`pl-10 ${errors.firstName ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Příjmení *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="lastName"
                type="text"
                placeholder="např. Novák"
                disabled={isSubmitting}
                className={`pl-10 ${errors.lastName ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email input */}
        <div>
          <label
            htmlFor="email"
            className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
          >
            E-mailová adresa *
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="např. tomas.novak@email.cz"
              disabled={isSubmitting}
              className={`pl-10 ${errors.email ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Na tento e-mail ti obratem pošleme vstupenku s osobním QR kódem.
            </p>
          )}
        </div>

        {/* City / Parish */}
        <div>
          <label
            htmlFor="city"
            className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
          >
            Bydliště / Farnost *
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="city"
              type="text"
              placeholder="např. Prostějov, Brodek, Plumlov..."
              disabled={isSubmitting}
              className={`pl-10 ${errors.city ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
              {...register("city")}
            />
          </div>
          {errors.city ? (
            <p className="mt-1 text-xs text-rose-400">{errors.city.message}</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Pomůže nám vědět, ze kterých koutů děkanátu na ples přijedete.
            </p>
          )}
        </div>
      </div>

      {/* 2. SECTION: Interactive Seating Map */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/25 pb-2">
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-primary" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
              2. Výběr místa u stolu (nepovinné)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fetchTableStatus(selectedEventId)}
              disabled={isLoadingTables}
              className="h-7 text-xs text-muted-foreground hover:text-primary px-2"
              title="Obnovit obsazenost stolů"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoadingTables ? "animate-spin text-primary" : ""}`}
              />
              Obnovit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSeatingMap(!showSeatingMap)}
              className="h-7 text-xs border-primary/30 text-foreground"
            >
              {showSeatingMap ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                  Skrýt mapu
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                  Zobrazit mapu sálu
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Informative prompt explaining reservation rules */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed space-y-1.5">
          <p className="text-foreground font-medium flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Jak funguje rezervace místa u stolu?</span>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs text-muted-foreground">
            <li>
              V sále je připraveno <strong>3 stoly na každé straně</strong>,
              každý stůl má <strong>8 míst k sezení</strong>.
            </li>
            <li>
              Každý účastník si může vybrat{" "}
              <strong>1 konkrétní volné místo</strong> na své jméno.
            </li>
            <li>
              <strong>Chcete sedět jako parta u jednoho stolu?</strong> Domluvte
              se předem a každý se zaregistrujte na volná místa u stejného
              stolu!
            </li>
            <li>
              <strong>Výběr je zcela dobrovolný.</strong> Pokud stůl
              nepotřebuješ nebo dáváš přednost tanečnímu parketu a baru, můžeš
              místo nechat nevybrané.
            </li>
          </ul>
        </div>

        {/* Selected seat badge */}
        {selectedTableNumber && selectedSeatNumber ? (
          <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/15 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                  Zvolené místo:
                </span>
                <p className="text-sm font-semibold text-primary">
                  Stůl {selectedTableNumber} • Místo {selectedSeatNumber}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSeatSelect(null, null)}
              className="text-xs text-muted-foreground hover:text-rose-400"
            >
              Zrušit výběr stolu
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-primary/30 p-2.5 text-center text-xs text-muted-foreground">
            Zatím nemáš vybraný žádný stůl. Klikni níže na libovolné volné číslo
            místa.
          </div>
        )}

        {/* Seating map container */}
        {showSeatingMap && (
          <div className="pt-2">
            {isLoadingTables ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Načítám aktuální plánek sálu...</span>
              </div>
            ) : (
              <SeatingMap
                tableCount={tableCount}
                seatsPerTable={seatsPerTable}
                reservedSeats={reservedSeats}
                selectedTableNumber={selectedTableNumber}
                selectedSeatNumber={selectedSeatNumber}
                onSelectSeat={handleSeatSelect}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. SECTION: GDPR & Ochrana osobních údajů */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 border-b border-primary/25 pb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
            3. Zpracování osobních údajů (GDPR)
          </h2>
        </div>

        <div className="rounded-xl border border-primary/30 bg-card/70 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded-xs border-primary/40 text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
              {...register("consent")}
            />
            <label
              htmlFor="consent"
              className="text-xs sm:text-sm text-foreground leading-snug cursor-pointer select-none"
            >
              Souhlasím se zpracováním osobních údajů za účelem organizace akce,
              vystavení a doručení vstupenky s QR kódem a rezervace místa u
              stolu. *
            </label>
          </div>

          {errors.consent && (
            <p className="text-xs font-semibold text-rose-400 pl-7">
              {errors.consent.message}
            </p>
          )}

          <div className="pt-1 pl-7">
            <button
              type="button"
              onClick={() => setShowGdprDetails(!showGdprDetails)}
              className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>
                {showGdprDetails
                  ? "Skrýt podrobné poučení o ochraně údajů"
                  : "Zobrazit podrobné informace o zpracování údajů (GDPR)"}
              </span>
            </button>
          </div>

          {/* Detailed GDPR statement */}
          {showGdprDetails && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-background/80 p-3.5 text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p className="font-semibold text-foreground">
                Informace o zpracování osobních údajů dle nařízení GDPR:
              </p>
              <p>
                <strong>Správce údajů:</strong> Mládež děkanátu Prostějov
                (pořadatel akce Církevní Silvestr).
              </p>
              <p>
                <strong>Účel zpracování:</strong> Registrace účastníka na akci,
                generování a doručení osobní QR vstupenky na e-mail, volitelná
                rezervace místa u stolu a rychlé odbavení při vstupu do sálu.
              </p>
              <p>
                <strong>Rozsah údajů:</strong> Jméno, příjmení, e-mailová
                adresa, farnost / obec a případně zvolené číslo stolu a židle.
              </p>
              <p>
                <strong>Doba uchování a zabezpečení:</strong> Údaje jsou
                uchovávány výhradně po dobu nezbytnou pro přípravu a realizaci
                této akce a nebudou předávány žádným třetím stranám ani
                komerčním subjektům.
              </p>
              <p>
                <strong>Vaše práva:</strong> Máte právo na přístup ke svým
                údajům, jejich opravu, přenositelnost či výmaz ze systému
                zasláním požadavku pořadatelům na e-mail či sociální sítě.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={isSubmitting}
          className="w-full text-base font-heading font-semibold tracking-wide uppercase shadow-lg shadow-primary/20 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generuji tvůj QR kód...</span>
            </>
          ) : (
            <>
              <span>Získat vstupní QR kód</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>

      <div className="rounded-lg border border-primary/25 bg-card/50 p-3 text-center text-xs text-muted-foreground">
        <p className="flex flex-wrap items-center justify-center gap-2 font-medium text-foreground">
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Bezpečné odeslání
          </span>
          <span className="text-primary/40">•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Vstupné dobrovolné
          </span>
          <span className="text-primary/40">•</span>
          <span>Okamžité vygenerování vstupenky</span>
        </p>
      </div>
    </form>
  );
}
