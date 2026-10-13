import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Církevní Silvestr | Mládež děkanátu Prostějov",
  description:
    "Registrace a rychlé odbavení na Církevní Silvestr mládeže děkanátu Prostějov. Vstup zdarma, žádné čekání ve frontách u vstupu.",
  openGraph: {
    title: "Církevní Silvestr | Mládež děkanátu Prostějov",
    description:
      "Zaregistruj se předem na Církevní Silvestr, získej vstupní QR kód a vstup na akci bez čekání ve frontě!",
    locale: "cs_CZ",
    type: "website",
  },
  icons: {
    icon: "/mdp-icon.png",
    apple: "/mdp-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script>
          {
            '(function(){try{var t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();'
          }
        </script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-orange-600/30 selection:text-orange-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
