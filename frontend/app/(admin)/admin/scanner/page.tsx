'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle2, QrCode, XCircle, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGetRaw, api } from '@/lib/api/client';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */
interface ScanResult {
  status: 'success' | 'error' | 'already';
  message: string;
  reservation?: {
    _id: string;
    confirmationCode: string;
    guestFirstName?: string;
    guestLastName?: string;
    partySize?: number;
    startAt?: string;
    venueId?: { name?: string } | string;
  };
}

/* ------------------------------------------------------------------ */
/* Scanner component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Start camera */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setCameraError('');
    } catch {
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }, []);

  /* Stop camera */
  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* Validate a code against the API */
  const validateCode = useCallback(async (code: string) => {
    if (loading) return;
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    try {
      // Try to find the reservation and check-in
      const data = await apiGetRaw<{ data?: { _id: string; confirmationCode: string; checkInStatus?: string; guestFirstName?: string; guestLastName?: string; partySize?: number; startAt?: string; venueId?: unknown } }>(
        `/reservations/scan?code=${encodeURIComponent(trimmed)}`
      );
      const r = data?.data ?? (data as unknown as { _id: string; confirmationCode: string; checkInStatus?: string });
      if (!r?._id) {
        setResult({ status: 'error', message: 'Code invalide ou réservation introuvable.' });
        return;
      }
      if ((r as { checkInStatus?: string }).checkInStatus === 'checked_in') {
        setResult({
          status: 'already',
          message: 'Déjà enregistré.',
          reservation: r as ScanResult['reservation'],
        });
        return;
      }
      // Mark as checked in
      await api.patch(`/reservations/${r._id}/checkin`, {});
      setResult({
        status: 'success',
        message: 'Entrée validée !',
        reservation: r as ScanResult['reservation'],
      });
    } catch {
      setResult({ status: 'error', message: 'Code invalide ou réservation introuvable.' });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  /* Scan QR from video frame using BarcodeDetector API (modern browsers) */
  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (img: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({ formats: ['qr_code'] });
        const codes = await detector.detect(canvas);
        if (codes.length > 0) {
          stopCamera();
          validateCode(codes[0].rawValue);
        }
      } catch { /* ignore */ }
    }
  }, [stopCamera, validateCode]);

  useEffect(() => {
    if (scanning) {
      intervalRef.current = setInterval(scanFrame, 400);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [scanning, scanFrame]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <QrCode className="size-6 text-amber-400" />
          Scanner d&apos;entrée
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Scannez le QR code d&apos;un client pour valider son entrée.
        </p>
      </div>

      {/* Camera view */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        <div className="relative aspect-video bg-zinc-900 flex items-center justify-center">
          <video
            ref={videoRef}
            className={cn('w-full h-full object-cover', !scanning && 'hidden')}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {!scanning && !cameraError && (
            <div className="text-center space-y-4 p-8">
              <Camera className="size-14 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">Caméra non active</p>
              <Button
                onClick={startCamera}
                className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-full gap-2"
              >
                <Camera className="size-4" />
                Démarrer la caméra
              </Button>
            </div>
          )}
          {cameraError && (
            <div className="text-center space-y-2 p-8">
              <XCircle className="size-10 text-red-400 mx-auto" />
              <p className="text-red-400 text-sm">{cameraError}</p>
            </div>
          )}
          {scanning && (
            <>
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-52 border-2 border-amber-400/70 rounded-xl relative">
                  <span className="absolute -top-px -left-px size-5 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                  <span className="absolute -top-px -right-px size-5 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                  <span className="absolute -bottom-px -left-px size-5 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                  <span className="absolute -bottom-px -right-px size-5 border-b-2 border-r-2 border-amber-400 rounded-br" />
                </div>
              </div>
              <Button
                onClick={stopCamera}
                variant="ghost"
                size="sm"
                className="absolute bottom-3 right-3 text-zinc-400 hover:text-zinc-100"
              >
                Arrêter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Manual code entry */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="text-zinc-300 font-medium mb-3 text-sm">Saisie manuelle du code</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && validateCode(manualCode)}
            placeholder="Ex: ABC12345"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 font-mono text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
          />
          <Button
            onClick={() => validateCode(manualCode)}
            disabled={!manualCode.trim() || loading}
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-xl px-5"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Valider'}
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={cn(
          'rounded-2xl border p-5 space-y-3',
          result.status === 'success' && 'border-emerald-500/30 bg-emerald-500/5',
          result.status === 'error' && 'border-red-500/30 bg-red-500/5',
          result.status === 'already' && 'border-amber-500/30 bg-amber-500/5',
        )}>
          <div className="flex items-center gap-2">
            {result.status === 'success' && <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />}
            {result.status === 'error' && <XCircle className="size-6 text-red-400 shrink-0" />}
            {result.status === 'already' && <CheckCircle2 className="size-6 text-amber-400 shrink-0" />}
            <span className={cn(
              'font-semibold',
              result.status === 'success' && 'text-emerald-400',
              result.status === 'error' && 'text-red-400',
              result.status === 'already' && 'text-amber-400',
            )}>
              {result.message}
            </span>
          </div>
          {result.reservation && (
            <div className="text-sm text-zinc-400 space-y-1 pt-2 border-t border-zinc-700">
              <p><span className="text-zinc-500">Code :</span> <span className="font-mono text-zinc-300">{result.reservation.confirmationCode}</span></p>
              {(result.reservation.guestFirstName ?? result.reservation.guestLastName) && (
                <p><span className="text-zinc-500">Client :</span> {result.reservation.guestFirstName} {result.reservation.guestLastName}</p>
              )}
              {result.reservation.partySize && (
                <p><span className="text-zinc-500">Personnes :</span> {result.reservation.partySize}</p>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-300"
            onClick={() => { setResult(null); setManualCode(''); startCamera(); }}
          >
            Scanner un autre code
          </Button>
        </div>
      )}
    </div>
  );
}
