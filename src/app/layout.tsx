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
  title: "Církevní Silvestr 2026 · Malý princ | Mládež děkanátu Prostějov",
  description:
    "Plesová oslava Církevního Silvestra na téma Malý princ. Sobota 28. listopadu 2026 v Brodku u Prostějova. Vstupné dobrovolné, rychlé odbavení s QR kódem.",
  openGraph: {
    title: "Církevní Silvestr 2026 · Malý princ | Mládež děkanátu Prostějov",
    description:
      "Sobota 28. listopadu 2026 v Brodku u Prostějova. Mše svatá v kostele, poté ples v hasičárně. Zaregistruj se předem a získej vstupní QR kód.",
    locale: "cs_CZ",
    type: "website",
  },
  icons: {
    icon: "/images/silvestr/mdp-logo.png",
    apple: "/images/silvestr/mdp-logo.png",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script>
          {
            '(function(){try{var t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();'
          }
        </script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-body selection:bg-[#b68235]/35 selection:text-[#f8f4f4]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
