"use client";

import { useState } from "react";
import {
  TIMEZONE,
  type LeaveByError,
  type LeaveBySuccess,
} from "@/lib/contract";

type Phase = "idle" | "locating" | "routing" | "ready" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLeaveByError(value: unknown): value is LeaveByError {
  return (
    isRecord(value) &&
    (value.error === "bad_origin" || value.error === "route_unavailable")
  );
}

function isLeaveBySuccess(value: unknown): value is LeaveBySuccess {
  if (!isRecord(value)) return false;
  return (
    typeof value.leave_at === "string" &&
    typeof value.optimal_sunset === "string" &&
    typeof value.sunset_date === "string" &&
    typeof value.travel_seconds === "number" &&
    Number.isFinite(value.travel_seconds) &&
    value.mode === "driving" &&
    value.timezone === TIMEZONE
  );
}

function readOrigin(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is unavailable on this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          reject(new Error("Location is unavailable."));
          return;
        }
        resolve({ lat, lon });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission was denied."));
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error("Location timed out. Try again."));
          return;
        }
        reject(new Error("Location is unavailable."));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}

function formatClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDrive(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0 && secs > 0) return `${minutes} min ${secs} sec`;
  if (minutes > 0) return `${minutes} min`;
  return `${secs} sec`;
}

export function LeaveByScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<LeaveBySuccess | null>(null);

  async function onUseLocation() {
    setPhase("locating");
    setMessage(null);
    setResult(null);

    let origin: { lat: number; lon: number };
    try {
      origin = await readOrigin();
    } catch (error) {
      setResult(null);
      setPhase("error");
      setMessage(
        error instanceof Error ? error.message : "Location is unavailable.",
      );
      return;
    }

    setPhase("routing");
    try {
      const response = await fetch("/api/leave-by", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: { lat: origin.lat, lon: origin.lon } }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (
        (isLeaveByError(data) && data.error === "route_unavailable") ||
        response.status === 502
      ) {
        setResult(null);
        setPhase("error");
        setMessage("The route is unavailable.");
        return;
      }

      if (!response.ok || !isLeaveBySuccess(data)) {
        setResult(null);
        setPhase("error");
        if (isLeaveByError(data) && data.error === "bad_origin") {
          setMessage("That location could not be used.");
          return;
        }
        setMessage("Could not get a leave time.");
        return;
      }

      setResult(data);
      setMessage(null);
      setPhase("ready");
    } catch {
      setResult(null);
      setPhase("error");
      setMessage("Could not get a leave time.");
    }
  }

  const busy = phase === "locating" || phase === "routing";

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onUseLocation}
        disabled={busy}
        className="inline-flex h-14 min-h-14 w-full items-center justify-center rounded-xl bg-foreground px-5 text-[17px] font-medium text-background disabled:opacity-60"
      >
        Use my location
      </button>
      <div role="status" aria-live="polite" className="flex flex-col gap-4">
        {phase === "locating" ? (
          <p className="text-[17px] leading-relaxed">Finding your location.</p>
        ) : null}
        {phase === "routing" ? (
          <p className="text-[17px] leading-relaxed">Checking the drive.</p>
        ) : null}
        {phase === "error" && message ? (
          <p className="text-[17px] leading-relaxed">{message}</p>
        ) : null}
        {phase === "ready" && result ? (
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[17px] leading-relaxed">Leave by</p>
              <p className="text-4xl font-semibold leading-tight tracking-tight">
                {formatClock(result.leave_at)}
              </p>
              <p className="text-[17px] leading-relaxed">
                {formatDay(result.leave_at)}
              </p>
              <p className="text-[17px] leading-relaxed">{result.timezone}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[17px] leading-relaxed">Sunset</p>
              <p className="text-2xl font-semibold leading-tight">
                {formatClock(result.optimal_sunset)}
              </p>
              <p className="text-[17px] leading-relaxed">{result.sunset_date}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[17px] leading-relaxed">Drive</p>
              <p className="text-[17px] leading-relaxed">
                {formatDrive(result.travel_seconds)}
              </p>
              <p className="text-[17px] leading-relaxed">{result.mode}</p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
