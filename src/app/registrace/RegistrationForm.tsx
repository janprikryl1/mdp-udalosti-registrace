"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerParticipantAction } from "@/app/actions/registration";
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

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (defaultEventId) return defaultEventId;
    return events[0]?.id || "";
  });

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      eventId: selectedEventId,
      firstName: "",
      lastName: "",
      email: "",
      city: "",
    },
  });

  const onSubmit = async (values: RegistrationFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await registerParticipantAction({
        ...values,
        eventId: selectedEventId || undefined,
      });

      if (!result.success || !result.registrationId) {
        setServerError(
          result.error ||
            "Při registraci došlo k chybě. Zkuste to prosím znovu.",
        );
        setIsSubmitting(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chyba registrace</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Event selection if multiple active events are available */}
      {events.length > 1 && (
        <div className="rounded-2xl border border-border bg-muted/60 p-4 space-y-2">
          <label
            htmlFor="event-select"
            className="block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Vyber událost, na kterou se hlásíš *
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={isSubmitting}
            className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
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
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          <span className="font-bold text-foreground">
            {currentEvent.title}
          </span>
          {currentEvent.date && (
            <span className="flex items-center gap-1">
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

      {/* Name and Surname row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
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
            className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
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
          className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
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
            Na tento e-mail ti pošleme potvrzení se vstupním QR kódem.
          </p>
        )}
      </div>

      {/* City / Parish */}
      <div>
        <label
          htmlFor="city"
          className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5"
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
            placeholder="např. Prostějov, Plumlov, Kostelec..."
            disabled={isSubmitting}
            className={`pl-10 ${errors.city ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}`}
            {...register("city")}
          />
        </div>
        {errors.city ? (
          <p className="mt-1 text-xs text-rose-400">{errors.city.message}</p>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pomůže nám to vědět, ze kterých koutů děkanátu přijedete.
          </p>
        )}
      </div>

      {/* Bezpečnost údajů & GDPR */}
      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-3.5">
        <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Bezpečí a ochrana osobních údajů</span>
        </div>

        {/* 3 pilíře bezpečnosti */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 p-2.5 shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Šifrovaný přenos</p>
              <p className="mt-0.5 leading-snug">
                Data i QR kód jsou chráněny šifrováním SSL/TLS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 p-2.5 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Pouze pro tuto akci
              </p>
              <p className="mt-0.5 leading-snug">
                Žádný spam ani poskytování údajů třetím stranám.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 p-2.5 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Omezený přístup</p>
              <p className="mt-0.5 leading-snug">
                K údajům má přístup pouze tým organizátorů u vstupu.
              </p>
            </div>
          </div>
        </div>

        {/* Informace o správci dle GDPR */}
        <div className="pt-2.5 border-t border-border/60 text-[11px] sm:text-xs leading-relaxed text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            Informace o zpracování osobních údajů (GDPR)
          </p>
          <p>
            Informujeme Vás tímto, že Sarkander z.&nbsp;s., IČ: 60043920, se
            sídlem Biskupské nám. 841/2, 779&nbsp;00 Olomouc, bude ve smyslu
            nařízení Evropského parlamentu a Rady (EU) 2016/679 o ochraně
            fyzických osob v souvislosti se zpracováním osobních údajů a volném
            pohybu těchto údajů a o zrušení směrnice 95/46/ES (toto nařízení
            bude dále označováno jen jako „GDPR“) zpracovávat osobní údaje
            uvedené v této přihlášce v souvislosti s pořádáním akce, k níž tato
            přihláška slouží, v pozici správce osobních údajů.
          </p>
          <p>
            Kompletní informaci o zpracování osobních údajů a kontakt pro Vaše
            dotazy k této problematice naleznete na webové stránce správce{" "}
            <a
              href="https://sarkander.ado.cz/gdpr/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5"
            >
              <span>sarkander.ado.cz/gdpr</span>
              <ExternalLink className="h-3 w-3 inline" />
            </a>
            .
          </p>
        </div>
      </div>

      {/* Submit Button using shadcn Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={isSubmitting}
          className="w-full text-base font-bold shadow-md shadow-orange-600/30"
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

      <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-center text-xs text-muted-foreground">
        <p className="flex flex-wrap items-center justify-center gap-2 font-medium text-foreground">
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            Bezpečné odeslání
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            100% zdarma
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>Okamžité vygenerování vstupenky</span>
        </p>
      </div>
    </form>
  );
}
