import { register } from "node:module";
import { getTimes } from "suncalc";

const hook = `
export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\\.(ts|js|mjs|cjs|json|node)$/.test(specifier)) {
    return nextResolve(specifier + ".ts", context);
  }
  return nextResolve(specifier, context);
}
`;

register("data:text/javascript," + encodeURIComponent(hook), {
  parentURL: new URL("../", import.meta.url).href,
});

const { TARGET, TIMEZONE } = await import("../lib/contract.ts");
const { calendarDate, zonedNoon } = await import("../lib/sun/time.ts");
const { drivingUrl } = await import("../lib/route/osrm.ts");
const { computeLeaveBy } = await import("../lib/route/leave-by.ts");

const origin = { lat: 42.3601, lon: -71.0589 };
const result = await computeLeaveBy(origin);
process.stdout.write(JSON.stringify(result) + "\n");

const failures = [];
if (result.target.lat !== TARGET.lat || result.target.lon !== TARGET.lon) {
  failures.push("target coordinate mismatch");
}
if (result.timezone !== TIMEZONE || result.mode !== "driving") {
  failures.push("timezone or mode mismatch");
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(result.sunset_date)) {
  failures.push("sunset_date");
}
const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/;
if (!iso.test(result.optimal_sunset) || !iso.test(result.leave_at)) {
  failures.push("iso offset");
}
if (result.optimal_sunset.endsWith("Z") || result.leave_at.endsWith("Z")) {
  failures.push("bare Z");
}

const noon = zonedNoon(result.sunset_date, TIMEZONE);
const sun = getTimes(noon, TARGET.lat, TARGET.lon).sunset;
if (sun == null || sun.getTime() !== Date.parse(result.optimal_sunset)) {
  failures.push("sunset is not suncalc");
}
if (calendarDate(sun, TIMEZONE) !== result.sunset_date) {
  failures.push("sunset calendar date");
}

const live = await fetch(drivingUrl(origin), {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(20_000),
});
if (!live.ok) {
  failures.push("osrm check fetch failed");
} else {
  const body = await live.json();
  const duration = body?.routes?.[0]?.duration;
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
    failures.push("osrm duration missing");
  } else if (duration !== result.travel_seconds) {
    failures.push("travel_seconds is not the live OSRM duration");
  }
}

const delta = (Date.parse(result.optimal_sunset) - Date.parse(result.leave_at)) / 1000;
if (Math.abs(delta - result.travel_seconds) > 0.001) {
  failures.push("leave_at is not sunset minus duration");
}

if (failures.length > 0) {
  console.error(failures.join("; "));
  process.exit(1);
}
