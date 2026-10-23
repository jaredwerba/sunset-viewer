import { TARGET, type Origin } from "../contract";

export class RouteUnavailable extends Error {
  constructor() {
    super("route_unavailable");
    this.name = "RouteUnavailable";
  }
}

export function drivingUrl(origin: Origin): string {
  return (
    "https://router.project-osrm.org/route/v1/driving/" +
    `${origin.lon},${origin.lat};${TARGET.lon},${TARGET.lat}?overview=false`
  );
}

export async function drivingSeconds(origin: Origin): Promise<number> {
  const url = drivingUrl(origin);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new RouteUnavailable();
  }
  if (!response.ok) throw new RouteUnavailable();

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RouteUnavailable();
  }
  if (payload === null || typeof payload !== "object") throw new RouteUnavailable();

  const code = (payload as { code?: unknown }).code;
  const routes = (payload as { routes?: unknown }).routes;
  if (code !== "Ok" || !Array.isArray(routes) || routes.length === 0) {
    throw new RouteUnavailable();
  }
  const duration = (routes[0] as { duration?: unknown }).duration;
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration < 0) {
    throw new RouteUnavailable();
  }
  return duration;
}
