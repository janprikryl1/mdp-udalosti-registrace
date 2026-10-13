"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  variant?: "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant = "outline",
  size = "sm",
  showLabel = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    const current =
      stored ||
      (document.documentElement.getAttribute("data-theme") as
        | "dark"
        | "light"
        | null) ||
      "dark";
    setTheme(current);
    document.documentElement.setAttribute("data-theme", current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Ignore storage errors if disabled
    }
  };

  // Avoid hydration mismatch by rendering a stable placeholder until mounted
  if (!mounted) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled
        aria-label="Načítám motiv..."
      >
        <Sun className="h-4 w-4 opacity-50" />
        {showLabel && <span>Motiv</span>}
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      title={isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
      aria-label={
        isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"
      }
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
      {showLabel && <span>{isDark ? "Světlý režim" : "Tmavý režim"}</span>}
    </Button>
  );
}
