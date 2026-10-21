"use client";

import confetti from "canvas-confetti";
import {
  Armchair,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  MapPin,
  QrCode,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RegistrationData {
  id: string;
  eventId?: string;
  eventTitle?: string;
  eventLocation?: string;
  eventDate?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  tableNumber?: number | null;
  seatNumber?: number | null;
  status: string;
  createdAt: string;
}

interface SuccessDisplayProps {
  registration: RegistrationData;
  qrDataUrl: string;
}

export function SuccessDisplay({
  registration,
  qrDataUrl,
}: SuccessDisplayProps) {
  const [copied, setCopied] = useState(false);
  const eventTitle =
    registration.eventTitle || "Církevní Silvestr 2026 – Malý princ";

  useEffect(() => {
    // Fire gold & celebratory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#b68235", "#e1ad66", "#f8f4f4", "#c28d41", "#7d5411"],
      });
    } catch {
      // Ignore if confetti fails in headless env
    }
  }, []);

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `vstupenka-qr-${registration.firstName.toLowerCase()}-${registration.lastName.toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generate .ics calendar file for Brodek u Prostějova
  const downloadCalendarFile = () => {
    const loc =
      registration.eventLocation || "Brodek u Prostějova (kostel & hasičárna)";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mladez DPV//Vstupenky//CS2026",
      "BEGIN:VEVENT",
      `UID:silvestr-2026-${registration.id}@dpv.cz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      "DTSTART:20261128T170000Z",
      "DTEND:20261129T020000Z",
      `SUMMARY:Církevní Silvestr 2026 – Malý princ`,
      `DESCRIPTION:Plesový Církevní Silvestr mládeže děkanátu Prostějov na téma Malý princ. Vstup s QR kódem.`,
      `LOCATION:${loc.replace(/,/g, "\\,")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cirkevni-silvestr-2026-${registration.firstName.toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Top Banner */}
      <Card className="border-primary/40 bg-card/70 p-6 sm:p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-primary shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="mt-4">
          <Badge variant="brand" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            <span>Registrace úspěšně potvrzena</span>
          </Badge>
        </div>
        <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          Těšíme se na tebe, {registration.firstName}!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Tvá registrace na <strong>{eventTitle}</strong> v Brodku u Prostějova
          je platná. Zde je tvůj osobní vstupní QR průkaz.
        </p>
      </Card>

      {/* Main Ticket Card — Classical Ball Invitation Ticket */}
      <div className="relative mx-auto max-w-md rounded-2xl border border-primary/50 bg-card/90 p-6 sm:p-8 shadow-2xl text-center">
        {/* Inner hairline border */}
        <div className="pointer-events-none absolute inset-2.5 sm:inset-3 rounded-xl border border-primary/25" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <Image
            src="/images/silvestr/mdp-logo.png"
            alt="Mládež děkanátu Prostějov"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <span className="font-body text-[11px] tracking-[0.2em] uppercase text-primary font-semibold">
            Mládež děkanátu Prostějov
          </span>
        </div>

        <div className="font-heading uppercase tracking-wider text-sm text-foreground/80">
          Vstupní průkaz · Plesová vstupenka
        </div>

        <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-semibold text-foreground">
          {registration.firstName} {registration.lastName}
        </h2>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-1 font-body">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>
            Farnost / bydliště:{" "}
            <strong className="text-foreground">{registration.city}</strong>
          </span>
        </p>

        {registration.tableNumber && registration.seatNumber ? (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/20 px-4 py-1 text-xs font-semibold text-primary">
            <Armchair className="h-3.5 w-3.5" />
            <span>
              Místo u stolu: Stůl {registration.tableNumber} • Místo{" "}
              {registration.seatNumber}
            </span>
          </div>
        ) : (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-muted/30 bg-muted/20 px-3.5 py-0.5 text-xs text-muted-foreground">
            <span>Bez rezervace stolu (volné stání & tanec)</span>
          </div>
        )}

        {/* Diamond separator */}
        <div className="diamond-separator my-4">
          <div className="diamond-dot" />
        </div>

        {/* Event Details on Pass */}
        <div className="font-body text-xs text-muted-foreground space-y-0.5">
          <p className="font-heading text-lg font-medium text-foreground">
            Církevní Silvestr 2026 · Malý princ
          </p>
          <p className="lining-nums">
            Sobota 28. listopadu 2026 · Brodek u Prostějova
          </p>
          <p className="text-primary font-semibold">
            18:00 mše svatá v kostele · 19:30 ples v hasičárně
          </p>
        </div>

        {/* QR Code Graphic Box - Clean high-contrast container for scanning */}
        <div className="relative mx-auto mt-5 max-w-xs rounded-xl border border-primary/40 bg-white p-5 shadow-inner">
          {qrDataUrl ? (
            // biome-ignore lint/performance/noImgElement: Data URL for generated QR code
            <img
              src={qrDataUrl}
              alt="QR kód pro vstup na ples"
              className="mx-auto h-52 w-52 rounded-lg bg-white p-1"
            />
          ) : (
            <div className="flex h-52 w-52 items-center justify-center rounded-lg bg-white font-mono text-xs text-slate-500">
              Načítání QR kódu...
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-700">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <span>
              Kód:{" "}
              <span className="font-mono text-slate-900">
                {registration.id.slice(0, 8)}...
              </span>
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground max-w-sm mx-auto font-body">
          <strong>Tip pro rychlý vstup:</strong> Ulož si tento QR kód do fotek v
          mobilu nebo měj připravený displej u vchodu.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 font-body">
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={downloadQrCode}
            className="w-full sm:w-auto font-semibold text-xs"
          >
            <Download className="h-4 w-4" />
            <span>Stáhnout QR kód</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadCalendarFile}
            className="w-full sm:w-auto text-xs"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span>Uložit do kalendáře</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="w-full sm:w-auto text-xs"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{copied ? "Zkopírováno!" : "Kopírovat odkaz"}</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-5 border-primary/25 bg-card/60 space-y-2.5">
        <h3 className="font-heading font-semibold text-foreground text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Potvrzení odesláno na e-mail
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kopii vstupenky a instrukce jsme poslali na adresu{" "}
          <strong className="text-foreground">{registration.email}</strong>.
          Pokud e-mail nevidíš, zkontroluj složku Hromadné nebo Spam.
        </p>
        <p className="text-xs text-muted-foreground">
          Kdyby se ti u vchodu vybil telefon, žádný strach – organizátoři tě
          snadno dohledají v databázi podle tvého jména a příjmení.
        </p>
      </Card>

      {/* Back to Home */}
      <div className="text-center pt-2">
        <Button asChild variant="ghost" size="sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zpět na program a pozvánku</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
