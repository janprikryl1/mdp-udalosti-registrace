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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform active:scale-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/25 p-1 group-hover:scale-105 transition-transform shadow-xs">
            <Image
              src="/mdp-icon.png"
              alt="Mládež Děkanátu Prostějov logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-bold text-foreground leading-tight tracking-tight text-base sm:text-lg">
              <span>Církevní Silvestr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mládež děkanátu Prostějov
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-muted text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Domů
          </Link>
          <Link
            href="/#o-akci"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            O akci
          </Link>
          <Link
            href="/#program"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Program
          </Link>
          <Link
            href="/#faq"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Časté dotazy
          </Link>
        </nav>

        {/* Action Buttons using shadcn Button */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />

          <Button
            asChild
            variant={isCheckin ? "secondary" : "outline"}
            size="sm"
          >
            <Link href="/checkin" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
              <span>Odbavení u vstupu</span>
            </Link>
          </Button>

          <Button asChild variant="brand" size="sm">
            <Link href="/registrace">Registrovat se</Link>
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
            className="text-foreground"
            aria-label="Přepnout menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card px-4 py-4 md:hidden shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Domů
            </Link>
            <Link
              href="/#o-akci"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              O akci
            </Link>
            <Link
              href="/#program"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Program večera
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Časté dotazy
            </Link>
            <div className="my-2 border-t border-border pt-2 flex flex-col gap-2">
              <Button asChild variant="brand" className="w-full">
                <Link
                  href="/registrace"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrovat se na akci
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link
                  href="/checkin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Vstup pro organizátory (Check-in)
                </Link>
              </Button>
              <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted-foreground">
                <span>Vzhled aplikace</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
