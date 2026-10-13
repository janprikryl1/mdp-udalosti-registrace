"use client";

import { ExternalLink, Heart, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 p-1">
                <Image
                  src="/mdp-icon.png"
                  alt="MDP logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              <span>Církevní Silvestr</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tradiční přátelské setkání a oslava pro mladé od 13 do 30 let
              pořádané mládeží děkanátu Prostějov. Vstup je pro všechny zdarma.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Užitečné odkazy
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://mladez.dpv.cz"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Oficiální web: mladez.dpv.cz</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://facebook.com/mladezprostejov"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Facebook Mládež Prostějov</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com/mladezprostejov"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Instagram @mladezprostejov</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              </li>
              <li>
                <Link
                  href="/registrace"
                  className="hover:text-primary transition-colors"
                >
                  Online registrace
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers & Entry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Pro organizátory
            </h4>
            <p className="text-sm text-muted-foreground">
              Odbavovací tým u vchodu používá QR čtečku v mobilním prohlížeči.
            </p>
            <div>
              <Link
                href="/checkin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                Vstup do systému odbavení (Check-in)
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2025–2026 Mládež děkanátu Prostějov & Pobočka spolku Sarkander.
          </p>
          <p className="flex items-center gap-1">
            Připraveno s{" "}
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> pro rychlý
            vstup bez front
          </p>
        </div>
      </div>
    </footer>
  );
}
