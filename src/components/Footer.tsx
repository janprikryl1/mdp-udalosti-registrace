"use client";

import { ExternalLink, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-primary/25 bg-card/75 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Diamond divider ornament */}
        <div className="diamond-separator mb-10">
          <div className="diamond-dot" />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-background/80 p-1.5 shadow-xs">
                <Image
                  src="/images/silvestr/mdp-logo.png"
                  alt="MDP logo"
                  width={34}
                  height={34}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="font-heading text-xl font-semibold tracking-wide text-foreground uppercase">
                  Církevní Silvestr
                </span>
                <p className="font-body text-xs tracking-[0.16em] uppercase text-primary">
                  Malý princ · 2026
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Plesové setkání a oslava přelomu církevního roku pro mladé lidi z
              celého děkanátu Prostějov i širokého okolí. Vstupné je dobrovolné.
            </p>
            <p className="font-body text-xs tracking-[0.14em] uppercase text-primary/80">
              Spolupořádá Sarkander z. s.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 font-body">
            <h4 className="font-heading text-sm font-semibold tracking-widest uppercase text-foreground">
              Odkazy & kontakty
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://instagram.com/mladezprostejov"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Instagram: @mladezprostejov</span>
                  <ExternalLink className="h-3 w-3 opacity-70 text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://facebook.com/mladezprostejov"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Facebook: Mládež Prostějov</span>
                  <ExternalLink className="h-3 w-3 opacity-70 text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://mladez.dpv.cz"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Web: mladez.dpv.cz</span>
                  <ExternalLink className="h-3 w-3 opacity-70 text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="/registrace"
                  className="hover:text-primary transition-colors font-medium text-foreground"
                >
                  Online registrace se vstupním QR kódem
                </Link>
              </li>
              <li>
                <Link
                  href="https://sarkander.ado.cz/gdpr/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5 text-xs text-muted-foreground/80"
                >
                  <span>Zpracování osobních údajů (GDPR)</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Practical Info & Check-in */}
          <div className="space-y-3 font-body">
            <h4 className="font-heading text-sm font-semibold tracking-widest uppercase text-foreground">
              Kdy a kde
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                Sobota 28. listopadu 2026
              </strong>
              <br />
              <span className="text-primary">18:00</span> Mše svatá v kostele
              <br />
              <span className="text-primary">19:30</span> Zahájení plesu v
              hasičárně
              <br />
              Brodek u Prostějova
            </p>

            <div className="pt-2">
              <Link
                href="/checkin"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Vstup pro organizátory u vchodu
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-body">
          <p>© 2026 Mládež děkanátu Prostějov & Sarkander z. s.</p>
          <p className="flex items-center gap-1">
            <span>Připraveno s</span>
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>pro skvělý Silvestr bez front</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
