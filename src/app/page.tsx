import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HandHeart,
  HelpCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllEvents } from "@/lib/registrations";

export const instant = false;

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

async function ActiveEventsList() {
  const events = await getAllEvents();
  const activeEvents = events.filter((e) => e.isActive);

  if (activeEvents.length <= 1) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="text-center mb-8">
        <span className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary">
          Další akce v nabídce
        </span>
        <h2 className="mt-1 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
          Otevřené registrace na akce mládeže
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto font-body">
          Vyber si akci a zajisti si své místo i QR vstupenku předem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeEvents.map((ev) => (
          <Card
            key={ev.id}
            className="flex flex-col justify-between p-6 transition-all hover:border-primary/60 hover:shadow-md"
          >
            <div>
              <Badge variant="brand" className="mb-3">
                <Sparkles className="h-3 w-3 mr-1" />
                Registrace otevřena
              </Badge>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {ev.title}
              </h3>
              {ev.description && (
                <p className="mt-2 font-body text-xs text-muted-foreground line-clamp-2">
                  {ev.description}
                </p>
              )}

              <div className="mt-4 space-y-1.5 font-body text-xs text-muted-foreground">
                {ev.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="lining-nums">
                      {new Intl.DateTimeFormat("cs-CZ", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(ev.date))}
                    </span>
                  </div>
                )}
                {ev.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button asChild variant="brand" className="w-full">
                <Link href={`/registrace?event=${encodeURIComponent(ev.slug)}`}>
                  <span>Zaregistrovat se</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-20">
      {/* HERO SECTION — PLESOVÁ POZVÁNKA */}
      <section className="relative overflow-hidden pt-8 sm:pt-14">
        {/* Subtle warm radial ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#b68235_0%,transparent_70%)] opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute top-96 -right-20 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,#e1ad66_0%,transparent_70%)] opacity-10 blur-2xl" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Main Invitation Canvas Box (Stylized like the 2a poster) */}
          <div className="relative rounded-2xl border border-primary/45 bg-card/60 p-6 sm:p-12 shadow-2xl backdrop-blur-xs">
            {/* Inner hairline border matching poster inset:48px */}
            <div className="pointer-events-none absolute inset-2.5 sm:inset-3.5 rounded-xl border border-primary/25" />

            {/* MDP Logo */}
            <div className="mx-auto flex justify-center mb-4">
              <Image
                src="/images/silvestr/mdp-logo.png"
                alt="Mládež děkanátu Prostějov"
                width={70}
                height={70}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>

            {/* Kicker */}
            <div className="font-body text-xs sm:text-sm tracking-[0.26em] uppercase text-primary font-medium">
              Mládež děkanátu Prostějov
            </div>

            {/* Subtitle */}
            <div className="font-body italic text-xl sm:text-2xl text-muted-foreground mt-3">
              srdečně zve na
            </div>

            {/* Main Title */}
            <h1 className="font-heading font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.05em] uppercase text-foreground leading-[0.98] mt-3">
              Církevní
              <br />
              Silvestr
            </h1>

            {/* Central Malý princ Medallion (Circular halo with outer ring) */}
            <div className="relative mx-auto my-7 w-56 h-56 sm:w-72 sm:h-72">
              {/* Outer gold halo ring */}
              <div className="absolute -inset-3.5 rounded-full border border-primary/60" />
              {/* Inner vignette circle with warm glow */}
              <div className="vignette-circle absolute inset-0 border border-primary/40 shadow-inner flex items-center justify-center">
                <Image
                  src="/images/silvestr/maly-princ-main.png"
                  alt="Malý princ"
                  width={450}
                  height={450}
                  className="w-full h-full object-cover scale-110"
                  priority
                />
              </div>
            </div>

            {/* Theme announcement */}
            <div className="font-body text-xs sm:text-sm tracking-[0.24em] uppercase text-primary">
              na téma
            </div>
            <div className="font-heading italic font-normal text-5xl sm:text-7xl text-primary leading-tight mt-1">
              Malý princ
            </div>

            {/* Diamond ornament divider */}
            <div className="diamond-separator my-5">
              <div className="diamond-dot" />
            </div>

            {/* Date & Location */}
            <div className="font-heading font-medium text-2xl sm:text-4xl text-foreground lining-nums">
              sobota 28. listopadu 2026
            </div>
            <div className="font-heading italic text-xl sm:text-3xl text-foreground/85 mt-1">
              Brodek u Prostějova
            </div>

            <div className="font-body text-sm sm:text-lg text-muted-foreground mt-3">
              <span className="lining-nums font-semibold text-primary">
                18:00
              </span>{" "}
              mše svatá v kostele · poté ples v hasičárně
            </div>

            {/* Price badge */}
            <div className="inline-block mt-4 px-4 py-1.5 border border-primary/50 rounded-md font-body text-xs sm:text-sm tracking-[0.2em] uppercase text-primary font-semibold bg-primary/10">
              Vstupné dobrovolné
            </div>

            <div className="mt-6 font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground/75">
              Spolupořádá Sarkander z. s.
            </div>
          </div>

          {/* Anti-Queue Quick Entry Pass Box */}
          <Card className="mx-auto mt-8 max-w-xl p-5 text-left border-primary/40 bg-card/80 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary shadow-xs">
                <Zap className="h-5 w-5" />
              </div>
              <div className="font-body">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Zaregistruj se předem a vyhni se čekání ve frontě u vstupu!
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Po odeslání krátkého formuláře ti obratem vygenerujeme osobní
                  vstupní QR kód. U vchodu do hasičárny jej stačí ukázat na
                  displeji mobilu – odbavení trvá jen 3 sekundy.
                </p>
              </div>
            </div>
          </Card>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              variant="brand"
              size="xl"
              className="w-full sm:w-auto font-heading tracking-wide uppercase text-sm"
            >
              <Link href="/registrace" className="group">
                <span>Zaregistrovat se zdarma</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full sm:w-auto font-heading tracking-wide uppercase text-sm"
            >
              <Link href="#o-akci">
                <span>Harmonogram & podrobnosti</span>
              </Link>
            </Button>
          </div>

          {/* Key Feature Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left font-body">
            <Card className="p-3.5 border-primary/25 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    100% Zdarma
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dobrovolné vstupné
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3.5 border-primary/25 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    Rychlý QR vstup
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Bez čekání v zimě
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3.5 border-primary/25 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    Věk 13–30 let
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Otevřeno pro všechny
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3.5 border-primary/25 bg-card/60">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Utensils className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    Bar & občerstvení
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Něco k pití i na zub
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 STEPS */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-primary/30 bg-card/50 p-6 sm:p-10 shadow-md">
          <div className="text-center">
            <span className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary">
              Jednoduchý proces
            </span>
            <h2 className="mt-1 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
              Jak probíhá odbavení u vstupu?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto font-body">
              Chceme, aby byl příchod plynulý, slavnostní a bez jakýchkoli
              zádrhelů ve frontách.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 font-body">
            {/* Step 1 */}
            <Card className="p-6 border-primary/25 bg-card/70 transition-transform hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground font-heading text-xl font-bold">
                1
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                Zaregistruješ se online
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Vyplníš své jméno, e-mail a odkud přijíždíš. Zabere ti to ani ne
                půl minuty.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 border-primary/25 bg-card/70 transition-transform hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/70 bg-primary/20 text-primary font-heading text-xl font-bold">
                2
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                Získáš svůj QR kód
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Kód se ihned zobrazí na displeji a přijde ti i do e-mailu. Můžeš
                si ho uložit jako fotku.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 border-primary/25 bg-card/70 transition-transform hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary font-heading text-xl font-bold">
                3
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">
                U vstupu pípneš a jdeš
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Organizátoři kamerou naskenují kód přímo z displeje mobilu a jsi
                během vteřiny uvnitř na plese.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* MULTI-EVENT SHOWCASE */}
      <Suspense fallback={null}>
        <ActiveEventsList />
      </Suspense>

      {/* EVENT DETAILS & HARMONOGRAM */}
      <section
        id="o-akci"
        className="mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Key Facts */}
          <div className="lg:col-span-5 space-y-6 font-body">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
                O tradici & tématu
              </span>
              <h2 className="mt-1 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
                Církevní Silvestr & Malý princ
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">
                Církevní rok nezačíná 1. ledna, ale 1. nedělí adventní. Proto se
                scházíme již v předvečer této neděle na slavnostním plese v
                Brodku u Prostějova, abychom poděkovali za uplynulý rok a s
                radostí, tancem a přáteli vstoupili do nového liturgického
                období.
              </p>
              <p className="mt-2 text-muted-foreground leading-relaxed text-sm italic">
                Letošním tématem je <strong>Malý princ</strong> – příběh o
                přátelství, zodpovědnosti za to, co jsme k sobě připoutali, a
                vidění srdcem.
              </p>
            </div>

            {/* Key cards */}
            <div className="space-y-3">
              <Card className="p-4 border-primary/25 bg-card/70">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Sobota 28. listopadu 2026
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Předvečer 1. neděle adventní
                    </p>
                    <p className="text-xs font-semibold text-primary mt-0.5 lining-nums">
                      Start v 18:00 mší svatou, poté ples
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-primary/25 bg-card/70">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Brodek u Prostějova
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      18:00 kostel Povýšení sv. Kříže
                    </p>
                    <p className="text-xs text-muted-foreground">
                      19:30 hasičská zbrojnice (hasičárna)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-primary/25 bg-card/70">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Co si vzít s sebou
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Plesové či slavnostní oblečení, čisté přezůvky do sálu,
                      dobrou náladu a drobné občerstvení na společný stůl.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Schedule from Graphic 2b */}
          <Card
            id="program"
            className="lg:col-span-7 p-6 sm:p-8 border-primary/35 bg-card/70 shadow-lg scroll-mt-20 font-body"
          >
            <div className="flex items-center gap-2.5 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-2xl font-semibold">
                Harmonogram večera
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Časový harmonogram plesu a slavnosti v Brodku u Prostějova.
            </p>

            {/* Schedule Table from Poster 2b */}
            <div className="mt-6 divide-y divide-primary/20 border-t border-primary/30">
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  18:00
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground">
                    Mše svatá v kostele
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Společná slavnostní bohoslužba na zahájení v kostele
                    Povýšení sv. Kříže.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  19:30
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground">
                    Zahájení plesu v hasičárně
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Rychlý příchod s QR kódem, odložení kabátů v šatně, welcome
                    drink a úvodní slovo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  20:00
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground">
                    Plesová zábava & hry
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Taneční hudba, seznamovací a týmové aktivity animátorů na
                    motivy Malého prince.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  22:00
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <span>Tombola</span>
                    <Badge variant="brand">Velké losování</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Vyhlášení výherců hodnotných i vtipných cen z tomboly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  23:30
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground">
                    Duchovní ztišení & chvály
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Prostor pro vděčnost za uplynulý rok a prosby do roku
                    nadcházejícího.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] items-baseline py-3.5">
                <span className="font-heading font-semibold text-2xl text-primary lining-nums">
                  00:00
                </span>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-foreground">
                    Nový církevní rok & přípitek
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Půlnoční odpočítávání, slavnostní přípitek a pokračování
                    volné plesové zábavy.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* TOMBOLA SHOWCASE — GRAPHIC 2c */}
      <section
        id="tombola"
        className="mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20"
      >
        <div className="relative rounded-2xl border border-primary/35 bg-card/60 p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Medallion with Tombola Illustration */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                <div className="absolute -inset-3 rounded-full border border-primary/60" />
                <div className="vignette-circle absolute inset-0 border border-primary/40 flex items-center justify-center p-2">
                  <Image
                    src="/images/silvestr/maly-princ-tombola.png"
                    alt="Tombola na Církevním Silvestru"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
              </div>
            </div>

            {/* Tombola Text & Call to Action (as in Story 2c) */}
            <div className="md:col-span-7 font-body text-center md:text-left">
              <div className="font-heading italic text-4xl sm:text-5xl text-primary leading-tight">
                Tombola
              </div>
              <h3 className="mt-2 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
                Chcete přispět darem do tomboly?
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Každý dar, ať už vlastnoručně vyrobený, sladký, praktický nebo
                knižní, udělá někomu velkou radost! Napište nám na Instagram a
                my vás nasměrujeme, kam dar předat.
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 border border-primary/40 rounded-lg px-3.5 py-2 bg-primary/10 max-w-full">
                <InstagramIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="font-body text-xs tracking-wider uppercase text-primary font-semibold">
                  Napište nám:
                </span>
                <span className="font-heading text-base sm:text-lg font-medium text-foreground">
                  @mladezprostejov
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Losování tomboly proběhne ve{" "}
                <span className="lining-nums font-semibold text-primary">
                  22:00
                </span>{" "}
                během plesu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VOLUNTEERS / POMOCNÍCI — GRAPHIC 2g */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-primary/35 bg-card/60 p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Helper Text */}
            <div className="md:col-span-7 order-2 md:order-1 font-body text-center md:text-left">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
                Tým Církevního Silvestra
              </span>
              <div className="font-heading italic text-3xl sm:text-4xl text-primary leading-tight mt-1">
                Hledáme pomocníky
              </div>
              <h3 className="mt-2 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
                Chceš nám pomoct s přípravou?
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Příprava sálu, výzdoba na téma Malého prince, pomoc u baru,
                technika nebo úklid. Každá ruka se počítá a u příprav zažiješ
                spoustu legrace v přátelské partě.
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 border border-primary/40 rounded-lg px-3.5 py-2 bg-primary/10 max-w-full">
                <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="font-heading text-sm sm:text-lg font-medium text-foreground text-center md:text-left">
                  Napiš nám na Instagram @mladezprostejov
                </span>
              </div>
            </div>

            {/* Medallion with Helper Graphic */}
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                <div className="absolute -inset-3 rounded-full border border-primary/60" />
                <div className="vignette-circle absolute inset-0 border border-primary/40 flex items-center justify-center p-2">
                  <Image
                    src="/images/silvestr/maly-princ-pomoc.png"
                    alt="Pomocníci na Církevním Silvestru"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAR & REFRESHMENTS — FROM GRAPHIC 2f */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-8 font-body">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Občerstvení na plese
          </span>
          <h2 className="mt-1 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
            Bar & společný stůl
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Během celého večera bude k dispozici bar se základním občerstvením a
            nealko nápoji za přátelské ceny, plus společný stůl, na který můžete
            přinést vlastní dobroty.
          </p>
        </div>

        <Card className="p-6 sm:p-8 border-primary/30 bg-card/70 font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-primary/20">
            {/* Drinks */}
            <div className="sm:pr-6">
              <div className="font-heading italic text-2xl text-primary text-center sm:text-left mb-4">
                Nápoje
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>
                    Kofola / Sodovka{" "}
                    <span className="text-xs text-muted-foreground italic">
                      (0,5 l)
                    </span>
                  </span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    10–20 Kč
                  </span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>Limetková & domácí limonáda</span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    20–25 Kč
                  </span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>Čaj & horká káva</span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    10–20 Kč
                  </span>
                </li>
              </ul>
            </div>

            {/* Snacks */}
            <div className="pt-6 sm:pt-0 sm:pl-6">
              <div className="font-heading italic text-2xl text-primary text-center sm:text-left mb-4">
                Něco na zub
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>Párek v rohlíku</span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    25 Kč
                  </span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>
                    Teplé toasty{" "}
                    <span className="text-xs text-muted-foreground italic">
                      (2 ks)
                    </span>
                  </span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    25 Kč
                  </span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-primary/10">
                  <span>Chipsy & slané mlsání</span>
                  <span className="font-heading font-medium text-primary lining-nums">
                    20 Kč
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section
        id="faq"
        className="mx-auto max-w-4xl px-4 sm:px-6 scroll-mt-20 font-body"
      >
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Máš otázky?
          </span>
          <h2 className="mt-1 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
            Časté dotazy
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          <Card className="p-4 sm:p-5 border-primary/25 bg-card/70">
            <h3 className="flex items-start gap-2.5 font-heading text-lg sm:text-xl font-semibold text-foreground leading-snug">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>Kolik stojí vstup na ples a oslavu?</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
              Vstup je pro všechny účastníky <strong>dobrovolný</strong>. Akci
              pořádá Mládež děkanátu Prostějov a Sarkander z. s. jako otevřené
              společenství. Pokud chceš přispět, můžeš vhodit příspěvek u vstupu
              nebo přinést něco dobrého na společný stůl.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-primary/25 bg-card/70">
            <h3 className="flex items-start gap-2.5 font-heading text-lg sm:text-xl font-semibold text-foreground leading-snug">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>Musím mít QR kód vytištěný na papíře?</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
              Vůbec ne! Stačí mít QR kód uložený v mobilu – buď v e-mailu, jako
              screenshot ve fotkách, nebo na potvrzovací stránce webu. Naše
              čtečka u vchodu do hasičárny jej bez problémů načte přímo z
              displeje.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-primary/25 bg-card/70">
            <h3 className="flex items-start gap-2.5 font-heading text-lg sm:text-xl font-semibold text-foreground leading-snug">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>Co si mám vzít na sebe? (Dress code)</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
              Jelikož se jedná o plesové zahájení církevního roku na téma{" "}
              <em>Malý princ</em>, doporučujeme společenské / plesové oblečení
              (např. košile, oblek, šaty). Prosíme také o{" "}
              <strong>přezůvky</strong> do tanečního sálu, abychom udrželi
              prostor čistý.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-primary/25 bg-card/70">
            <h3 className="flex items-start gap-2.5 font-heading text-lg sm:text-xl font-semibold text-foreground leading-snug">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>Můžu vzít s sebou kamarády, kteří nejsou věřící?</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
              Určitě ano! Jsme otevřené společenství pro všechny mladé lidi
              (doporučený věk 13–30 let), kteří hledají dobré přátele a skvělou
              zábavu. Stačí, když se každý kamarád zaregistruje zvlášť, aby měl
              svůj vlastní QR kód pro vstup.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA BANNER (WITH FOX / MALÝ PRINC ILLUSTRATION) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-gradient-to-b from-[#2a2420] to-[#1d1b1a] p-6 sm:p-12 text-center text-foreground shadow-2xl">
          {/* Subtle gold glow */}
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-primary/20 blur-3xl" />

          <div className="mx-auto mb-4 w-24 h-24 sm:w-28 sm:h-28 relative">
            <Image
              src="/images/silvestr/maly-princ-liska.png"
              alt="Malý princ a liška"
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="font-body text-[11px] sm:text-xs tracking-[0.16em] sm:tracking-[0.2em] uppercase text-primary font-semibold">
            Sobota 28. listopadu 2026 · Brodek u Prostějova
          </div>
          <h2 className="mt-2 font-heading text-2xl sm:text-5xl font-semibold tracking-normal text-foreground">
            Nenechávej to na poslední chvíli
          </h2>
          <p className="mx-auto mt-2 sm:mt-3 max-w-xl font-body text-xs sm:text-base text-muted-foreground leading-relaxed">
            Registrace zabere jen 30 vteřin. Ušetři si stání ve frontě a pojď si
            Církevní Silvestr užít na maximum!
          </p>

          <div className="mt-6 sm:mt-8 flex justify-center">
            <Button
              asChild
              variant="brand"
              size="xl"
              className="w-full sm:w-auto font-heading uppercase tracking-wider text-xs sm:text-sm px-5 sm:px-10 shadow-lg text-center"
            >
              <Link href="/registrace" className="group flex items-center justify-center gap-1.5">
                <span className="truncate">Vyplnit rychlou registraci zdarma</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
