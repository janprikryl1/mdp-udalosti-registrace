import {
  ArrowLeft,
  Clock,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { getAllEvents } from "@/lib/registrations";
import { RegistrationForm } from "./RegistrationForm";

export const instant = false;

export const metadata: Metadata = {
  title: "Registrace se vstupním QR kódem | Církevní Silvestr 2026",
  description:
    "Rychlá online registrace na Církevní Silvestr 2026 – Malý princ v Brodku u Prostějova. Získej svůj osobní QR kód pro vstup bez front.",
};

async function RegistraceContent({
  searchParams,
}: {
  searchParams?: Promise<{ event?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedEventSlugOrId = resolvedParams.event?.toLowerCase().trim();

  const allEvents = await getAllEvents();
  const activeEvents = allEvents.filter((e) => e.isActive);

  // Match requested event by slug or ID, or fallback to first active event
  const selectedEvent =
    (requestedEventSlugOrId
      ? activeEvents.find(
          (e) =>
            e.slug.toLowerCase() === requestedEventSlugOrId ||
            e.id === requestedEventSlugOrId,
        )
      : null) ||
    activeEvents[0] ||
    allEvents[0];

  const pageTitle = selectedEvent
    ? `Registrace na ${selectedEvent.title}`
    : "Registrace na Církevní Silvestr 2026";

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 sm:py-16 font-body">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute top-10 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#b68235_0%,transparent_70%)] opacity-15 blur-3xl" />

      <div className="mx-auto max-w-3xl lg:max-w-4xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Zpět na pozvánku a program</span>
        </Link>

        {/* Card */}
        <Card className="relative p-6 sm:p-10 shadow-2xl border-primary/40 bg-card/80 backdrop-blur-xs">
          {/* Inner hairline frame */}
          <div className="pointer-events-none absolute inset-2.5 sm:inset-3 rounded-lg border border-primary/20" />

          <div className="text-center pb-6 border-b border-primary/25">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 p-2 shadow-xs mb-3">
              <Image
                src="/images/silvestr/mdp-logo.png"
                alt="Mládež děkanátu Prostějov"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-0.5 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Vstup bez čekání ve frontě</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
              {pageTitle}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {selectedEvent?.description ||
                "Vyplň své jméno a e-mail a obratem získej osobní vstupní QR kód do mobilu."}
            </p>
          </div>

          <div className="mt-8">
            <RegistrationForm
              events={activeEvents}
              defaultEventId={selectedEvent?.id}
            />
          </div>
        </Card>

        {/* Reassurance pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Zabere 30 sekund
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Šifrované spojení (SSL)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Osobní údaje nikde nešíříme
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Vstupné dobrovolné
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RegistracePage(props: {
  searchParams?: Promise<{ event?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Načítám formulář registrace...</p>
        </div>
      }
    >
      <RegistraceContent searchParams={props.searchParams} />
    </Suspense>
  );
}
