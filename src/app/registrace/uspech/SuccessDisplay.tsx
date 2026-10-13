"use client";

import confetti from "canvas-confetti";
import {
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
  const eventTitle = registration.eventTitle || "Církevní Silvestr";

  useEffect(() => {
    // Fire confetti celebration on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ea580c", "#f59e0b", "#ec4899", "#10b981"],
      });
    } catch {
      // Ignore if canvas-confetti fails in some environments
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

  // Generate .ics calendar file for the event
  const downloadCalendarFile = () => {
    const loc =
      registration.eventLocation || "Farní sál u Povýšení sv. Kříže, Prostějov";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mladez DPV//Vstupenky//CS",
      "BEGIN:VEVENT",
      `UID:akce-${registration.id}@dpv.cz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      "DTSTART:20261128T170000Z",
      "DTEND:20261129T020000Z",
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:Vstupenka na ${eventTitle} (Mládež DPV). Vstup s QR kódem.`,
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
    a.download = `vstupenka-${registration.firstName.toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="border-emerald-500/25 bg-emerald-950/20 p-6 sm:p-8 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <div className="mt-4">
          <Badge variant="success" className="gap-1.5 px-3 py-1 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Registrace úspěšně potvrzena</span>
          </Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
          Těšíme se na tebe, {registration.firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Tvá registrace na <strong>{eventTitle}</strong> byla úspěšně uložena.
          Zde je tvůj vstupní QR kód.
        </p>
      </Card>

      {/* Main Ticket Card - STRICTLY LIGHT PASS FOR MAXIMUM SCANNER CONTRAST AND PRINTING */}
      <div className="ticket-light mx-auto max-w-md rounded-3xl border-2 border-orange-200 bg-white p-6 sm:p-8 shadow-2xl text-center text-slate-900">
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 uppercase tracking-widest border border-orange-200">
          Vstupní průkaz
        </span>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {registration.firstName} {registration.lastName}
        </h2>
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1 font-medium">
          <MapPin className="h-3.5 w-3.5 text-orange-600" />
          <span>{registration.city}</span>
        </p>

        {/* QR Code Graphic Box - Always Pure White & Cream */}
        <div className="relative mx-auto mt-6 max-w-xs rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/70 p-6 shadow-inner">
          {qrDataUrl ? (
            // biome-ignore lint/performance/noImgElement: Data URL for generated QR code
            <img
              src={qrDataUrl}
              alt="QR kód pro vstup"
              className="mx-auto h-56 w-56 rounded-xl bg-white p-3 shadow-md border border-orange-200"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-xl bg-white font-mono text-xs text-slate-400">
              Načítání QR kódu...
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-orange-900">
            <QrCode className="h-3.5 w-3.5 text-orange-600" />
            <span>
              Kód:{" "}
              <span className="font-mono">
                {registration.id.slice(0, 8)}...
              </span>
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold text-slate-600 max-w-sm mx-auto">
          💡 <strong>Tip pro rychlý vstup:</strong> Ulož si tento QR kód do
          fotek v mobilu nebo měj připravený displej u vchodu.
        </p>

        {/* Action Buttons inside light ticket */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="brand"
            size="default"
            onClick={downloadQrCode}
            className="w-full sm:w-auto font-bold"
          >
            <Download className="h-4 w-4" />
            <span>Stáhnout QR kód (obrázek)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={downloadCalendarFile}
            className="w-full sm:w-auto border-orange-200 bg-white text-slate-800 hover:bg-orange-50 font-semibold"
          >
            <Calendar className="h-4 w-4 text-orange-600" />
            <span>Uložit do kalendáře</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={copyLink}
            className="w-full sm:w-auto border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-semibold"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4 text-slate-500" />
            )}
            <span>{copied ? "Zkopírováno!" : "Kopírovat odkaz"}</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
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
          snadno dohledají v databázi podle jména a příjmení.
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
            <span>Zpět na hlavní stránku</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
