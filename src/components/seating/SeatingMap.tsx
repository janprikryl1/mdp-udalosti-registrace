"use client";

import {
  Armchair,
  Check,
  GlassWater,
  LogIn,
  Music,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ReservedSeat {
  tableNumber: number;
  seatNumber: number;
}

export interface AdminSeatAssignment {
  tableNumber: number;
  seatNumber: number;
  registration: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    status: string;
  };
}

interface SeatingMapProps {
  tableCount?: number;
  seatsPerTable?: number;
  reservedSeats?: ReservedSeat[];
  selectedTableNumber?: number | null;
  selectedSeatNumber?: number | null;
  onSelectSeat?: (
    tableNumber: number | null,
    seatNumber: number | null,
  ) => void;
  // If provided, admin details are displayed
  adminAssignments?: AdminSeatAssignment[];
  isAdminView?: boolean;
  onTableCountChange?: (newCount: number) => void;
  isUpdatingTableCount?: boolean;
}

export function SeatingMap({
  tableCount = 6,
  seatsPerTable = 8,
  reservedSeats = [],
  selectedTableNumber = null,
  selectedSeatNumber = null,
  onSelectSeat,
  adminAssignments,
  isAdminView = false,
  onTableCountChange,
  isUpdatingTableCount = false,
}: SeatingMapProps) {
  // Map reserved seats for fast lookup: "table-seat"
  const reservedSet = useMemo(() => {
    const set = new Set<string>();
    for (const s of reservedSeats) {
      set.add(`${s.tableNumber}-${s.seatNumber}`);
    }
    return set;
  }, [reservedSeats]);

  // Admin assignments lookup
  const adminAssignmentMap = useMemo(() => {
    const map = new Map<string, AdminSeatAssignment["registration"]>();
    if (adminAssignments) {
      for (const a of adminAssignments) {
        map.set(`${a.tableNumber}-${a.seatNumber}`, a.registration);
      }
    }
    return map;
  }, [adminAssignments]);

  // Split tables into left side and right side according to sketch
  const { leftTables, rightTables } = useMemo(() => {
    const leftCount = Math.ceil(tableCount / 2);
    const left: number[] = [];
    const right: number[] = [];

    for (let i = 1; i <= leftCount; i++) {
      left.push(i);
    }
    for (let i = leftCount + 1; i <= tableCount; i++) {
      right.push(i);
    }
    return { leftTables: left, rightTables: right };
  }, [tableCount]);

  const totalSeats = tableCount * seatsPerTable;
  const occupiedCount = reservedSeats.length;
  const freeCount = Math.max(0, totalSeats - occupiedCount);

  // Split seatsPerTable into top row (1..half) and bottom row (half+1..total)
  const topSeatIndices = useMemo(() => {
    const half = Math.ceil(seatsPerTable / 2);
    const arr: number[] = [];
    for (let i = 1; i <= half; i++) arr.push(i);
    return arr;
  }, [seatsPerTable]);

  const bottomSeatIndices = useMemo(() => {
    const half = Math.ceil(seatsPerTable / 2);
    const arr: number[] = [];
    for (let i = half + 1; i <= seatsPerTable; i++) arr.push(i);
    return arr;
  }, [seatsPerTable]);

  const handleSeatClick = (tNum: number, sNum: number) => {
    if (isAdminView) return;
    if (!onSelectSeat) return;

    // Check if this seat is occupied
    const isOccupied = reservedSet.has(`${tNum}-${sNum}`);
    if (isOccupied) return;

    // If currently selected, toggle off
    if (selectedTableNumber === tNum && selectedSeatNumber === sNum) {
      onSelectSeat(null, null);
    } else {
      onSelectSeat(tNum, sNum);
    }
  };

  const renderSeat = (tableNumber: number, seatNumber: number) => {
    const key = `${tableNumber}-${seatNumber}`;
    const isOccupied = reservedSet.has(key);
    const isSelected =
      selectedTableNumber === tableNumber && selectedSeatNumber === seatNumber;
    const adminData = adminAssignmentMap.get(key);

    let seatClasses =
      "relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md font-heading text-xs font-bold transition-all duration-150 select-none";

    if (isSelected) {
      seatClasses +=
        " bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10 cursor-pointer";
    } else if (isOccupied) {
      seatClasses +=
        " bg-muted/40 text-muted-foreground/40 border border-muted/30 cursor-not-allowed opacity-60";
    } else {
      seatClasses +=
        " bg-card/90 text-foreground border border-primary/40 hover:border-primary hover:bg-primary/20 hover:scale-105 shadow-xs cursor-pointer";
    }

    const titleText = isSelected
      ? `Tvé vybrané místo: Stůl ${tableNumber}, Místo ${seatNumber}`
      : isOccupied
        ? adminData
          ? `Obsazeno: ${adminData.firstName} ${adminData.lastName} (${adminData.city})`
          : `Místo ${seatNumber} (Stůl ${tableNumber}) - již obsazeno`
        : `Volné místo ${seatNumber} u Stolu ${tableNumber} - kliknutím vybereš`;

    return (
      <button
        key={seatNumber}
        type="button"
        title={titleText}
        aria-label={titleText}
        disabled={isOccupied && !isAdminView}
        onClick={() => handleSeatClick(tableNumber, seatNumber)}
        className={seatClasses}
      >
        {isSelected ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : isOccupied ? (
          <span className="text-[10px] opacity-70">✕</span>
        ) : (
          <span className="text-[11px] font-semibold">{seatNumber}</span>
        )}

        {/* Small tooltip for admin view */}
        {isAdminView && adminData && (
          <span className="sr-only">
            {adminData.firstName} {adminData.lastName}
          </span>
        )}
      </button>
    );
  };

  const renderTable = (tableNumber: number) => {
    // Count occupied seats at this specific table
    let tableOccupied = 0;
    for (let s = 1; s <= seatsPerTable; s++) {
      if (reservedSet.has(`${tableNumber}-${s}`)) tableOccupied++;
    }

    const isThisTableSelected = selectedTableNumber === tableNumber;

    return (
      <div
        key={tableNumber}
        className={`group relative rounded-xl border p-2.5 sm:p-3 transition-all ${
          isThisTableSelected
            ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
            : "border-primary/25 bg-card/60 hover:border-primary/50 hover:bg-card/90"
        }`}
      >
        {/* Table header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-xs sm:text-sm font-semibold tracking-wide text-foreground">
              Stůl {tableNumber}
            </span>
          </div>
          <span
            className={`text-[10px] font-medium lining-nums px-1.5 py-0.5 rounded-full ${
              tableOccupied === seatsPerTable
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : tableOccupied > 0
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/30 text-muted-foreground border border-border/40"
            }`}
          >
            {tableOccupied}/{seatsPerTable}
          </span>
        </div>

        {/* Seats Container as in sketch (4 seats top, table surface in middle, 4 seats bottom) */}
        <div className="space-y-1.5">
          {/* Top row of seats */}
          <div className="flex items-center justify-between gap-1">
            {topSeatIndices.map((sNum) => renderSeat(tableNumber, sNum))}
          </div>

          {/* Table surface line / visual wood divider */}
          <div className="relative my-1 flex h-4 items-center justify-center rounded-xs border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/25 to-primary/10 shadow-inner">
            {/* Center dashed line matching user drawing */}
            <div className="absolute inset-y-0 left-1/2 w-0 border-r border-dashed border-primary/60 -translate-x-1/2" />
            <span className="text-[9px] font-heading font-medium uppercase tracking-wider text-primary/75">
              Stůl {tableNumber}
            </span>
          </div>

          {/* Bottom row of seats */}
          <div className="flex items-center justify-between gap-1">
            {bottomSeatIndices.map((sNum) => renderSeat(tableNumber, sNum))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Top statistics & quick info bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-card/70 p-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-heading font-semibold text-foreground flex items-center gap-1.5">
            <Armchair className="h-4 w-4 text-primary" />
            <span>Kapacita stolů:</span>
          </span>
          <span className="text-muted-foreground">
            Celkem{" "}
            <strong className="text-foreground lining-nums">
              {totalSeats}
            </strong>{" "}
            míst ({tableCount} stolů)
          </span>
          <span className="text-primary/40 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="lining-nums">{freeCount}</strong> volných
          </span>
          <span className="text-primary/40 hidden sm:inline">•</span>
          <span className="text-muted-foreground">
            <strong className="text-foreground lining-nums">
              {occupiedCount}
            </strong>{" "}
            obsazeno
          </span>
        </div>

        {/* Admin quick table count increase/decrease */}
        {isAdminView && onTableCountChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-heading">
              Počet stolů:
            </span>
            <div className="flex items-center gap-1 bg-background/80 rounded-lg border border-primary/30 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-foreground hover:text-primary"
                disabled={tableCount <= 2 || isUpdatingTableCount}
                onClick={() => onTableCountChange(tableCount - 1)}
                title="Snížit počet stolů o 1"
              >
                -
              </Button>
              <span className="px-2 font-heading font-bold lining-nums text-foreground">
                {tableCount}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-foreground hover:text-primary"
                disabled={tableCount >= 40 || isUpdatingTableCount}
                onClick={() => onTableCountChange(tableCount + 1)}
                title="Zvýšit počet stolů o 1"
              >
                +
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ballroom Graphic Frame */}
      <div className="relative rounded-2xl border-2 border-primary/40 bg-radial-[at_top] from-[#231e1a] via-[#151312] to-[#0c0b0a] p-3 sm:p-5 shadow-2xl overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* TOP: VCHOD (Entrance) */}
        <div className="relative z-10 mx-auto mb-4 flex max-w-xs flex-col items-center">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-4 py-1 text-xs font-heading font-semibold uppercase tracking-widest text-primary shadow-xs">
            <LogIn className="h-3.5 w-3.5" />
            <span>VCHOD DO SÁLU</span>
          </div>
          <div className="mt-1 h-3 w-28 border-b-2 border-dashed border-primary/40" />
        </div>

        {/* SIDE MARKERS + TABLES GRID */}
        <div className="relative z-10 grid grid-cols-12 gap-3 items-start">
          {/* LEFT WALL / FOTOKOUTEK */}
          <div className="col-span-12 sm:col-span-2 order-2 sm:order-1 flex sm:flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 sm:py-6 text-center">
            <Sparkles className="h-4 w-4 text-amber-400 mb-1" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-amber-300">
              FOTOKOUTEK
            </span>
            <span className="hidden sm:block text-[10px] text-amber-400/70 mt-1">
              Malý princ
            </span>
          </div>

          {/* MAIN TABLES AREA: LEFT TABLES - CENTER OPEN SPACE - RIGHT TABLES */}
          <div className="col-span-12 sm:col-span-8 order-1 sm:order-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Left side tables */}
            <div className="space-y-3">
              <div className="text-center font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-primary/20 pb-1">
                Levá strana ({leftTables.length} stolů)
              </div>
              {leftTables.map((tNum) => renderTable(tNum))}
            </div>

            {/* Right side tables */}
            <div className="space-y-3">
              <div className="text-center font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-primary/20 pb-1">
                Pravá strana ({rightTables.length} stolů)
              </div>
              {rightTables.map((tNum) => renderTable(tNum))}
            </div>
          </div>

          {/* RIGHT WALL / BAR */}
          <div className="col-span-12 sm:col-span-2 order-3 flex sm:flex-col items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 sm:py-6 text-center">
            <GlassWater className="h-4 w-4 text-sky-400 mb-1" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-sky-300">
              BAR
            </span>
            <span className="hidden sm:block text-[10px] text-sky-400/70 mt-1">
              Občerstvení
            </span>
          </div>
        </div>

        {/* BOTTOM: HUDBA / PARKET (Stage / Dance Floor) */}
        <div className="relative z-10 mx-auto mt-5 flex max-w-md flex-col items-center">
          <div className="mb-1 h-3 w-40 border-t-2 border-dashed border-primary/40" />
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/50 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 px-5 py-2 text-center shadow-lg">
            <Music className="h-4 w-4 text-primary animate-bounce" />
            <span className="font-heading text-xs sm:text-sm font-semibold uppercase tracking-widest text-foreground">
              HUDBA • PÓDIUM • TANEČNÍ PARKET
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Selected Seat Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-primary/25 bg-card/50 p-3 text-xs text-muted-foreground">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-xs border border-primary/50 bg-card text-[10px] font-semibold text-foreground">
              1
            </span>
            <span>Volné místo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-xs bg-primary text-primary-foreground text-[10px]">
              <Check className="h-3 w-3" />
            </span>
            <span className="font-medium text-foreground">Vybrané místo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-xs bg-muted/40 border border-muted/30 text-[9px] text-muted-foreground">
              ✕
            </span>
            <span>Obsazeno</span>
          </div>
        </div>

        {/* Selection status or clear button */}
        {!isAdminView && (
          <div>
            {selectedTableNumber && selectedSeatNumber ? (
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="text-xs px-2.5 py-1">
                  <Armchair className="h-3.5 w-3.5 mr-1" />
                  Stůl {selectedTableNumber} • Místo {selectedSeatNumber}
                </Badge>
                {onSelectSeat && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectSeat(null, null)}
                    className="h-7 text-xs text-muted-foreground hover:text-rose-400"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Zrušit výběr
                  </Button>
                )}
              </div>
            ) : (
              <span className="text-[11px] italic text-muted-foreground">
                (Výběr stolu je nepovinný – můžeš nechat nevybráno)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
