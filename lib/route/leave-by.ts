import {
  TARGET,
  TIMEZONE,
  type LeaveBySuccess,
  type Origin,
} from "../contract";
import { formatOffsetIso } from "../sun/time";
import { optimalSunset } from "../sun/sunset";
import { drivingSeconds, RouteUnavailable } from "./osrm";

export { RouteUnavailable };

export function parseOrigin(body: unknown): Origin | null {
  if (body === null || typeof body !== "object") return null;
  const origin = (body as { origin?: unknown }).origin;
  if (origin === null || typeof origin !== "object") return null;
  const lat = (origin as { lat?: unknown }).lat;
  const lon = (origin as { lon?: unknown }).lon;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export async function computeLeaveBy(origin: Origin, now: Date = new Date()): Promise<LeaveBySuccess> {
  if (TIMEZONE !== "America/New_York") {
    throw new Error("timezone_mismatch");
  }
  const { instant, sunsetDate } = optimalSunset(now);
  const travelSeconds = await drivingSeconds(origin);
  const leave = new Date(instant.getTime() - travelSeconds * 1000);
  return {
    target: {
      lat: TARGET.lat,
      lon: TARGET.lon,
      label: TARGET.label,
    },
    optimal_sunset: formatOffsetIso(instant, TIMEZONE),
    sunset_date: sunsetDate,
    travel_seconds: travelSeconds,
    leave_at: formatOffsetIso(leave, TIMEZONE),
    mode: "driving",
    timezone: "America/New_York",
  };
}
