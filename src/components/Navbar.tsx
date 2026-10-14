"use client";

import { CheckCircle2, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCheckin = pathname?.startsWith("/checkin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/25 bg-background/92 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 transition-transform active:scale-98"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-card/80 p-1.5 shadow-xs transition-transform group-hover:border-primary">
            <Image
              src="/images/silvestr/mdp-logo.png"
              alt="Mládež Děkanátu Prostějov"
              width={34}
              height={34}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="font-heading text-lg font-medium tracking-wide uppercase text-foreground leading-tight sm:text-xl">
              Církevní Silvestr{" "}
              <span className="font-normal text-primary">2026</span>
            </div>
            <p className="font-body text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              Malý princ · Brodek u Prostějova
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 font-body text-sm">
          <Link
            href="/"
            className={`rounded-md px-3.5 py-1.5 transition-colors ${
              pathname === "/"
                ? "bg-primary/15 text-primary font-medium border border-primary/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Domů
          </Link>
          <Link
            href="/#o-akci"
            className="rounded-md px-3.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            O akci
          </Link>
          <Link
            href="/#program"
            className="rounded-md px-3.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Harmonogram
          </Link>
          <Link
            href="/#tombola"
            className="rounded-md px-3.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Tombola
          </Link>
          <Link
            href="/#faq"
            className="rounded-md px-3.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Dotazy
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />

          <Button
            asChild
            variant={isCheckin ? "secondary" : "outline"}
            size="sm"
            className="text-xs"
          >
            <Link href="/checkin" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Odbavení u vstupu</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="brand"
            size="sm"
            className="text-xs font-semibold"
          >
            <Link href="/registrace">Registrace zdarma</Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <ThemeToggle size="icon" variant="ghost" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground border border-primary/30"
            aria-label="Přepnout menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-primary/30 bg-card/95 px-4 py-4 md:hidden shadow-xl animate-in slide-in-from-top-2 backdrop-blur-md">
          <div className="flex flex-col gap-1.5 font-body">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted"
            >
              Domů
            </Link>
            <Link
              href="/#o-akci"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted"
            >
              O akci & Malý princ
            </Link>
            <Link
              href="/#program"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted"
            >
              Harmonogram večera
            </Link>
            <Link
              href="/#tombola"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted"
            >
              Tombola & dary
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base text-foreground hover:bg-muted"
            >
              Časté dotazy
            </Link>
            <div className="my-2 border-t border-primary/20 pt-3 flex flex-col gap-2">
              <Button asChild variant="brand" className="w-full">
                <Link
                  href="/registrace"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrovat se na ples (zdarma)
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link
                  href="/checkin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Vstup pro pořadatele (Check-in)
                </Link>
              </Button>
              <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted-foreground">
                <span>Vzhled zobrazení</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
