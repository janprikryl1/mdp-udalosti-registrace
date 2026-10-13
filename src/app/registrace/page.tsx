import {
  ArrowLeft,
  Clock,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { getAllEvents } from "@/lib/registrations";
import { RegistrationForm } from "./RegistrationForm";

export const instant = false;

export const metadata: Metadata = {
  title: "Registrace | Akce mládeže děkanátu Prostějov",
  description:
    "Rychlá online registrace na akce mládeže děkanátu Prostějov. Získej QR kód pro vstup bez front.",
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
    : "Registrace na akci";

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 sm:py-16">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute top-10 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/15 to-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Zpět na přehled akce</span>
        </Link>

        {/* Card */}
        <Card className="p-6 sm:p-10 shadow-xl border-border bg-card">
          <div className="text-center pb-6 border-b border-border">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30 mb-4">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 px-3 py-1 text-xs font-semibold text-orange-400 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Vstup bez front</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {pageTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedEvent?.description ||
                "Vyplň údaje a obratem získej svůj osobní vstupní QR kód."}
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
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            Šifrované zabezpečení (SSL)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Osobní údaje nikde nešíříme
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Vstup 100% zdarma
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
