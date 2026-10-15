"use client";

import { type CameraDevice, Html5Qrcode } from "html5-qrcode";
import { CameraOff, FlipHorizontal, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  isPaused: boolean;
}

export function QrScanner({ onScan, isPaused }: QrScannerProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);
  const containerId = "qr-reader-container";

  // Discover cameras on mount
  useEffect(() => {
    let mounted = true;

    async function initCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (mounted) {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Default to back camera if identifiable
            const backCam = devices.find(
              (c) =>
                c.label.toLowerCase().includes("back") ||
                c.label.toLowerCase().includes("rear") ||
                c.label.toLowerCase().includes("environment"),
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
          setIsInitializing(false);
        }
      } catch (err) {
        if (mounted) {
          console.warn("Could not list cameras:", err);
          setIsInitializing(false);
        }
      }
    }

    initCameras();

    return () => {
      mounted = false;
    };
  }, []);

  // Start or stop scanner
  useEffect(() => {
    if (isInitializing) return;

    let isSubscribed = true;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    async function startScanner() {
      try {
        setCameraError(null);

        const config = {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        const cameraConfig =
          selectedCameraId && cameras.length > 0
            ? selectedCameraId
            : { facingMode };

        await scanner.start(
          cameraConfig,
          config,
          (decodedText) => {
            if (!isSubscribed) return;

            const now = Date.now();
            // Throttle: don't scan same code within 2.5 seconds or when paused
            if (
              isPaused ||
              (decodedText === lastScannedCodeRef.current &&
                now - lastScannedTimeRef.current < 2500)
            ) {
              return;
            }

            lastScannedCodeRef.current = decodedText;
            lastScannedTimeRef.current = now;
            onScan(decodedText);
          },
          () => {
            // Frame parse error - ignore standard frame drops
          },
        );

        if (isSubscribed) {
          setIsScanning(true);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Camera start error:", err);
          setCameraError(
            err instanceof Error
              ? err.message
              : "Nepodařilo se spustit kameru. Zkontrolujte oprávnění v prohlížeči.",
          );
          setIsScanning(false);
        }
      }
    }

    startScanner();

    return () => {
      isSubscribed = false;
      if (scanner.isScanning) {
        scanner
          .stop()
          .then(() => {
            try {
              scanner.clear();
            } catch {}
          })
          .catch((e) => console.warn("Scanner stop warning:", e));
      }
    };
  }, [
    selectedCameraId,
    facingMode,
    isInitializing,
    isPaused,
    cameras.length,
    onScan,
  ]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setSelectedCameraId("");
  };

  const restartScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setFacingMode((prev) => prev);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Camera Viewport Frame */}
      <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-2xl border-4 border-primary bg-card shadow-xl">
        {/* HTML5 QR Container */}
        <div id={containerId} className="w-full h-full object-cover" />

        {/* Laser Scanning Animation overlay when active */}
        {isScanning && !isPaused && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative h-60 w-60 rounded-xl border-2 border-white/60">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 h-6 w-6 border-t-4 border-l-4 border-[#e1ad66] -mt-1 -ml-1 rounded-tl-sm" />
              <div className="absolute top-0 right-0 h-6 w-6 border-t-4 border-r-4 border-[#e1ad66] -mt-1 -mr-1 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-[#e1ad66] -mb-1 -ml-1 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-[#e1ad66] -mb-1 -mr-1 rounded-br-sm" />

              {/* Laser line */}
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-[#b68235] via-[#e1ad66] to-[#b68235] shadow-xs shadow-[#e1ad66] animate-pulse" />
            </div>
            <p className="mt-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-xs font-body">
              Namiřte kameru na QR kód účastníka
            </p>
          </div>
        )}

        {/* Loading state */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card text-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-body">
              Spouštím kameru...
            </p>
          </div>
        )}

        {/* Error state */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 p-6 text-center text-foreground font-body">
            <CameraOff className="h-10 w-10 text-rose-500 mb-2" />
            <h4 className="text-sm font-bold">Kamera není dostupná</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xs">
              Povolte prosím přístup ke kameře v prohlížeči, nebo použijte
              manuální zadání kódu/e-mailu níže.
            </p>
            <button
              type="button"
              onClick={restartScanner}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Zkusit znovu
            </button>
          </div>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
        {cameras.length > 1 && (
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="w-full sm:w-auto max-w-xs rounded-xl border border-input bg-card px-3 py-2 sm:py-1.5 text-xs font-semibold text-foreground shadow-2xs focus:border-ring focus:outline-hidden text-center sm:text-left"
          >
            {cameras.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.label || `Kamera ${i + 1}`}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 sm:py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors shrink-0"
          >
            <FlipHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>
              Přepnout kameru ({facingMode === "environment" ? "zadní" : "přední"})
            </span>
          </button>

          <button
            type="button"
            onClick={restartScanner}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 sm:py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors shrink-0"
            title="Restartovat snímač"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Obnovit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
