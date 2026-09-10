"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScanLine, CheckCircle2, Camera, XCircle } from "lucide-react";

type ScanResult = {
  checkIn: boolean;
  checkedInAt: string | null;
  attendee: {
    attendeeId: string;
    name: string;
    email: string;
    college: string;
    eventName: string;
    registrationId: string;
  };
};

export function ScanBox() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [scanMode, setScanMode] = React.useState<"manual" | "camera">("manual");
  const html5QrCodeRef = React.useRef<any>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const scannerStartingRef = React.useRef(false);
  const scriptLoadRef = React.useRef<Promise<void> | null>(null);

  React.useEffect(() => {
    if ((window as any).Html5Qrcode || scriptLoadRef.current) return;

    scriptLoadRef.current = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src*="html5-qrcode"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Unable to load QR scanner")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.7/dist/html5-qrcode.min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load QR scanner"));
      document.body.appendChild(script);
    });

    return () => {
      void stopQRScanner();
    };
  }, []);

  React.useEffect(() => {
    if (scanMode !== "camera" || !videoContainerRef.current || scannerStartingRef.current) return;

    let cancelled = false;
    scannerStartingRef.current = true;
    setError(null);

    async function startScanner() {
      try {
        await scriptLoadRef.current;
        if (cancelled || !videoContainerRef.current) return;

        const Html5Qrcode = (window as any).Html5Qrcode;
        if (!Html5Qrcode) throw new Error("QR scanner library is unavailable");

        const scanner = new Html5Qrcode(videoContainerRef.current.id);
        html5QrCodeRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            void stopQRScanner();
            setToken(decodedText);
            void processScan(decodedText);
          },
          () => {}
        );
      } catch (err: any) {
        if (cancelled) return;
        console.error("Camera start error:", err);

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access denied. Please allow camera permissions in your browser.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError(`Camera error: ${err.message || "Please check permissions and try again."}`);
        }

        setScanMode("manual");
        html5QrCodeRef.current = null;
      } finally {
        scannerStartingRef.current = false;
      }
    }

    void startScanner();
    return () => {
      cancelled = true;
    };
  }, [scanMode]);

  function startQRScanner() {
    setScanMode("camera");
    setError(null);
  }

  async function stopQRScanner() {
    const scanner = html5QrCodeRef.current;
    html5QrCodeRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch {}
    }
    setScanMode("manual");
  }

  async function processScan(scannedToken: string) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Scan failed");
      const scanResult = data.data as ScanResult;
      setResult(scanResult);
      toast.success(scanResult.checkIn ? "Checked in" : "Checked out");
      setToken("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function manualScan(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    await processScan(token.trim());
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanLine className="h-4 w-4 text-muted-foreground" /> Scan QR pass
          </CardTitle>
          <CardDescription>
            Use camera to scan the QR code from the participant&apos;s digital pass
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full gap-2 mb-4">
            <Button
              type="button"
              variant={scanMode === "camera" ? "destructive" : "default"}
              onClick={scanMode === "manual" ? startQRScanner : stopQRScanner}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {scanMode === "manual" ? (
                <>
                  <Camera className="h-4 w-4" />
                  Scan with Camera
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Stop Camera
                </>
              )}
            </Button>
          </div>
          
          {scanMode === "camera" && (
            <div className="mb-4">
              <div id="qr-reader" ref={videoContainerRef} className="w-full" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Point camera at QR code to scan automatically
              </p>
            </div>
          )}

          {scanMode === "manual" && (
            <form onSubmit={manualScan} className="flex w-full gap-2">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter QR token (QR-...)"
                className="flex-1 font-mono"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !token.trim()}>
                {loading ? "..." : "Scan"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {result && (
        <Card className={result.checkIn ? "border-green-300 bg-green-50/60" : "border-amber-300 bg-amber-50/60"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-5 w-5 ${result.checkIn ? "text-green-600" : "text-amber-600"}`}
              />
              <CardTitle className="text-base">
                {result.checkIn ? "Checked in" : "Checked out"}
              </CardTitle>
            </div>
            <CardDescription>
              {result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Name" value={result.attendee.name} />
            <Info label="Attendee" value={result.attendee.attendeeId} />
            <Info label="College" value={result.attendee.college} />
            <Info label="Event" value={result.attendee.eventName} />
            <Info label="Registration" value={result.attendee.registrationId} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">State</span>
              <Badge variant={result.checkIn ? "default" : "outline"}>
                {result.checkIn ? "CHECKED_IN" : "NOT_CHECKED_IN"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
