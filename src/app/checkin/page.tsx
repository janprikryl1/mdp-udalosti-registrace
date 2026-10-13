import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { isOrganizerAuthenticated } from "@/lib/auth";
import { getAllEvents, getCheckinStats } from "@/lib/registrations";
import { CheckinDashboard } from "./CheckinDashboard";
import { LoginForm } from "./LoginForm";

export const instant = false;

export const metadata: Metadata = {
  title: "Odbavení u vstupu | Církevní Silvestr",
  description:
    "Rozhraní pro odbavení a skenování QR kódů účastníků akce Církevní Silvestr.",
};

async function CheckinContent() {
  const isAuthenticated = await isOrganizerAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12">
        <LoginForm />
      </div>
    );
  }

  const [stats, events] = await Promise.all([
    getCheckinStats(),
    getAllEvents(),
  ]);

  return (
    <div className="min-h-[calc(100vh-140px)] py-6 sm:py-10">
      <CheckinDashboard initialStats={stats} initialEvents={events} />
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Načítám odbavovací terminál...</p>
        </div>
      }
    >
      <CheckinContent />
    </Suspense>
  );
}
