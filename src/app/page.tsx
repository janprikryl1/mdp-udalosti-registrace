import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllEvents } from "@/lib/registrations";

export const instant = false;

async function ActiveEventsList() {
  const events = await getAllEvents();
  const activeEvents = events.filter((e) => e.isActive);

  if (activeEvents.length <= 1) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold tracking-widest text-primary uppercase">
          Kalendář akcí
        </span>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
          Otevřené registrace na akce mládeže
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          Vyber si akci a zajisti si své místo i QR vstupenku předem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeEvents.map((ev) => (
          <Card
            key={ev.id}
            className="flex flex-col justify-between p-6 transition-all hover:shadow-md"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-400 mb-3 border border-orange-500/20">
                <Sparkles className="h-3 w-3" />
                <span>Registrace otevřena</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{ev.title}</h3>
              {ev.description && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {ev.description}
                </p>
              )}

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                {ev.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
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
              <Button asChild variant="brand" className="w-full font-bold">
                <Link href={`/registrace?event=${encodeURIComponent(ev.slug)}`}>
                  <span>Zaregistrovat se</span>
                  <ArrowRight className="h-4 w-4" />
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
    <div className="flex flex-col gap-16 pb-20 sm:gap-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14">
        {/* Subtle decorative background gradient glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-rose-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-48 -right-20 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-2xl" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Mládež děkanátu Prostějov uvádí</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-bold">Vstupné ZDARMA</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.15]">
            Oslav s námi{" "}
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">
              Církevní Silvestr
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Přelom církevního roku, skvělá parta mladých lidí z celého děkanátu,
            hry, hudba, společná modlitba i půlnoční přípitek. Přijď zažít večer
            plný radosti a nových přátelství.
          </p>

          {/* Anti-Queue Notice Box */}
          <Card className="mx-auto mt-8 max-w-xl p-4 text-left sm:p-5 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-600/30">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Zaregistruj se předem a vyhni se čekání ve frontě u vstupu!
                </h2>
                <p className="mt-1 text-xs text-muted-foreground leading-normal">
                  Po odeslání formuláře ti obratem vygenerujeme osobní vstupní
                  QR kód. U vchodu jej stačí ukázat na displeji mobilu –
                  odbavení zabere jen 3 sekundy.
                </p>
              </div>
            </div>
          </Card>

          {/* CTAs using shadcn Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              asChild
              variant="brand"
              size="xl"
              className="w-full sm:w-auto"
            >
              <Link href="/registrace" className="group">
                <span>Zaregistrovat se zdarma</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full sm:w-auto"
            >
              <Link href="#o-akci">
                <span>Zjistit podrobnosti</span>
              </Link>
            </Button>
          </div>

          {/* Feature Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
            <Card className="rounded-2xl p-3 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    100% Zdarma
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Žádné vstupné
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-3 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Rychlý QR vstup
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Žádné čekání v zimě
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-3 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Věk 13–30 let
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Otevřeno všem
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-3 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Raut & bufet
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Společné dobroty
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 FAST STEPS */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 shadow-sm">
          <div className="text-center">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Jednoduchý proces
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
              Jak probíhá odbavení u vstupu?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Chceme, aby byl příchod plynulý, teplý a bez jakýchkoli zádrhelů.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <Card className="rounded-2xl p-6 shadow-2xs transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white font-extrabold text-lg shadow-sm shadow-orange-600/30">
                1
              </div>
              <h3 className="mt-4 font-bold text-foreground text-base">
                Zaregistruješ se online
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Vyplníš své jméno, e-mail a odkud přijíždíš. Zabere ti to ani ne
                půl minuty.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="rounded-2xl p-6 shadow-2xs transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white font-extrabold text-lg shadow-sm shadow-amber-500/30">
                2
              </div>
              <h3 className="mt-4 font-bold text-foreground text-base">
                Získáš svůj QR kód
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Kód se ihned zobrazí na obrazovce a přijde ti i do e-mailu.
                Můžeš si ho uložit jako fotku.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="rounded-2xl p-6 shadow-2xs transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg shadow-sm shadow-emerald-600/30">
                3
              </div>
              <h3 className="mt-4 font-bold text-foreground text-base">
                U vstupu pípneš a jdeš
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Organizátoři kamerou naskenují kód přímo z displeje mobilu a jsi
                během vteřiny uvnitř.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* MULTI-EVENT SHOWCASE (if more than 1 active event exists) */}
      <Suspense fallback={null}>
        <ActiveEventsList />
      </Suspense>

      {/* EVENT DETAILS & PROGRAM */}
      <section
        id="o-akci"
        className="mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Key Facts */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                O akci
              </span>
              <h2 className="mt-1 text-3xl font-extrabold text-foreground">
                Co je Církevní Silvestr?
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">
                Církevní rok nezačíná 1. ledna, ale 1. nedělí adventní. Proto se
                scházíme již v předvečer této neděle, abychom poděkovali za
                uplynulý rok a s radostí, modlitbou a přáteli vstoupili do
                nového liturgického období.
              </p>
            </div>

            {/* Key cards */}
            <div className="space-y-3">
              <Card className="rounded-2xl p-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Kdy se koná
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sobota před 1. nedělí adventní
                    </p>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      Start v 18:00
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Kde se potkáme
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Farní sál u Povýšení sv. Kříže
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Filipcovo nám. 2, Prostějov
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Co si vzít s sebou
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Přezůvky, dobrou náladu a drobné slané či sladké
                      občerstvení na společný švédský stůl.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Schedule */}
          <Card
            id="program"
            className="lg:col-span-7 rounded-3xl p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <div className="flex items-center gap-2 text-foreground font-bold text-xl">
              <Clock className="h-5 w-5 text-primary" />
              <h3>Program večera</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Časový harmonogram je orientační, atmosféra je uvolněná a
              přátelská.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4 border-l-2 border-orange-500 pl-4">
                <span className="font-mono text-sm font-bold text-orange-400 w-14 shrink-0">
                  18:00
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Otevření dveří a přivítání
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Rychlé odbavení s QR kódem, odložení kabátů, welcome drink a
                    seznámení.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-l-2 border-orange-400/70 pl-4">
                <span className="font-mono text-sm font-bold text-orange-400 w-14 shrink-0">
                  18:30
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Seznamovací a týmové hry
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Zábavné aktivity připravené animátory, u kterých poznáš lidi
                    z jiných farností.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-l-2 border-orange-400/50 pl-4">
                <span className="font-mono text-sm font-bold text-orange-400 w-14 shrink-0">
                  20:00
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Společný raut & kvíz
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ochutnávka dobrot ze společného stolu, hospodský kvíz o ceny
                    a volný pokec.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-l-2 border-amber-500/70 pl-4">
                <span className="font-mono text-sm font-bold text-amber-400 w-14 shrink-0">
                  22:30
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Chvály & duchovní ztišení
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Akustické chvály, prostor pro vděčnost za uplynulý rok a
                    osobní zamyšlení.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-l-2 border-amber-500 pl-4">
                <span className="font-mono text-sm font-bold text-amber-400 w-14 shrink-0">
                  23:30
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Půlnoční adorace & požehnání
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Společná adorace v kostele s požehnáním do nového církevního
                    roku.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-l-2 border-orange-500 pl-4">
                <span className="font-mono text-sm font-bold text-orange-400 w-14 shrink-0">
                  00:00
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Půlnoční přípitek & odpočítávání
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Přípitek dětským šampaňským / moštem, přání a pokračování
                    volné zábavy.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 scroll-mt-20">
        <div className="text-center">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            Máš otázky?
          </span>
          <h2 className="mt-1 text-3xl font-extrabold text-foreground">
            Časté dotazy
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          <Card className="rounded-2xl p-5 shadow-2xs">
            <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Kolik stojí vstup na akci?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Vstup je pro všechny účastníky <strong>zcela zdarma</strong>. Akci
              pořádá mládež děkanátu Prostějov jako otevřené společenství. Pokud
              chceš přispět, můžeš přinést něco dobrého k jídlu na společný
              stůl.
            </p>
          </Card>

          <Card className="rounded-2xl p-5 shadow-2xs">
            <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Musím mít QR kód vytištěný na papíře?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Vůbec ne! Stačí mít QR kód uložený v mobilu – buď v e-mailu, jako
              screenshot ve fotkách, nebo na děkovací stránce webu. Naše čtečka
              u vchodu jej bez problémů načte přímo z displeje.
            </p>
          </Card>

          <Card className="rounded-2xl p-5 shadow-2xs">
            <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Co když se nestihnu předem zaregistrovat?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Důrazně doporučujeme registraci předem, protože právě díky ní
              nevznikají fronty a organizátoři vědí, pro kolik lidí připravit
              prostor a program. Pokud někdo přijde bez kódu, odbavíme ho
              manuálně, ale bude muset počkat.
            </p>
          </Card>

          <Card className="rounded-2xl p-5 shadow-2xs">
            <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              Můžu vzít s sebou kamarády, kteří nejsou věřící?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Určitě ano! Jsme otevřené společenství pro všechny mladé lidi,
              kteří hledají dobré přátele a smysluplnou zábavu. Stačí, když se
              každý kamarád zaregistruje zvlášť, aby měl svůj vlastní QR kód.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-8 sm:p-12 text-center text-white shadow-xl shadow-orange-600/20">
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Nenechávej to na poslední chvíli
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-orange-100 sm:text-lg">
            Registrace zabere 30 vteřin. Ušetři si stání ve frontě a pojď si
            Silvestr užít na maximum!
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="xl"
              className="bg-white text-orange-700 hover:bg-orange-50 hover:scale-105 active:scale-95 shadow-lg font-bold"
            >
              <Link href="/registrace" className="group">
                <span>Vyplnit rychlou registraci</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
