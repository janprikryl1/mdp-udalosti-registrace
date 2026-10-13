import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRegistrationDetailsAction } from "@/app/actions/registration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SuccessDisplay } from "./SuccessDisplay";

export const instant = false;

export const metadata: Metadata = {
  title: "Vstupenka vygenerována | Církevní Silvestr Prostějov",
  description:
    "Tvá vstupenka a QR kód na Církevní Silvestr mládeže děkanátu Prostějov.",
};

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="border-amber-500/30 bg-amber-950/20 p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h1 className="text-xl font-bold text-foreground">
            Nebylo zadáno ID registrace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Zdá se, že odkaz neobsahuje identifikační kód tvé registrace.
          </p>
          <div className="mt-6">
            <Button asChild variant="brand">
              <Link href="/registrace">Přejít na registraci</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const result = await getRegistrationDetailsAction(id);

  if (!result.success || !result.registration) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="border-rose-500/30 bg-rose-950/20 p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h1 className="text-xl font-bold text-foreground">
            Registrace nenalezena
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Zadaný kód v systému neexistuje. Zkontrolujte prosím odkaz v
            e-mailu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/" className="inline-flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Hlavní stránka</span>
              </Link>
            </Button>
            <Button asChild variant="brand">
              <Link href="/registrace">Nová registrace</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 sm:py-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <SuccessDisplay
          registration={result.registration}
          qrDataUrl={result.qrDataUrl || ""}
        />
      </div>
    </div>
  );
}

export default function RegistraceUspechPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Načítám vstupenku...</p>
        </div>
      }
    >
      <SuccessContent searchParams={props.searchParams} />
    </Suspense>
  );
}
