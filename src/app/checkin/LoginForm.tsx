"use client";

import { AlertCircle, KeyRound, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginOrganizerAction } from "@/app/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginOrganizerAction(password);
      if (!result.success) {
        setError(result.error || "Nesprávné heslo");
        setIsSubmitting(false);
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.refresh();
      }
    } catch {
      setError("Chyba při přihlašování. Zkuste to znovu.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 font-body">
      <Card className="relative p-6 sm:p-8 shadow-2xl border-primary/40 bg-card/80 text-center">
        <div className="pointer-events-none absolute inset-2.5 rounded-lg border border-primary/20" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 p-2 shadow-xs mb-3">
          <Image
            src="/images/silvestr/mdp-logo.png"
            alt="Mládež děkanátu Prostějov"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>

        <Badge
          variant="brand"
          className="uppercase font-bold tracking-wider mb-2"
        >
          Odbavení u vstupu
        </Badge>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Přihlášení organizátora
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Tato sekce je určena pro obsluhu a animátory u vchodu na ples
          Církevního Silvestra.
        </p>

        {error && (
          <div className="mt-6 text-left">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chyba přihlášení</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label
              htmlFor="organizer-password"
              className="block font-heading text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Heslo pro odbavení
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="organizer-password"
                type="password"
                placeholder="Zadejte heslo organizátora"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={isSubmitting}
            className="w-full font-heading font-semibold uppercase tracking-wide shadow-md shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ověřuji heslo...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Přihlásit k odbavení</span>
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
