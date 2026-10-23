export function calendarDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function addCalendarDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function offsetMinutes(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  return parseOffsetMinutes(name ?? "");
}

export function formatOffsetIso(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(instant);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  let hour = pick("hour");
  if (hour === "24") hour = "00";
  const ms = String(instant.getMilliseconds()).padStart(3, "0");
  const offset = formatOffsetSuffix(pick("timeZoneName"));
  return `${pick("year")}-${pick("month")}-${pick("day")}T${hour}:${pick("minute")}:${pick("second")}.${ms}${offset}`;
}

export function zonedNoon(ymd: string, timeZone: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  let utc = Date.UTC(year, month - 1, day, 12, 0, 0);
  for (let i = 0; i < 3; i++) {
    const next = Date.UTC(year, month - 1, day, 12, 0, 0) - offsetMinutes(new Date(utc), timeZone) * 60_000;
    if (next === utc) break;
    utc = next;
  }
  const noon = new Date(utc);
  if (calendarDate(noon, timeZone) !== ymd) {
    throw new Error("noon_date_mismatch");
  }
  return noon;
}

function parseOffsetMinutes(timeZoneName: string): number {
  if (timeZoneName === "GMT") return 0;
  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error("offset_unavailable");
  }
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? "0"));
}

function formatOffsetSuffix(timeZoneName: string): string {
  if (timeZoneName === "GMT") return "+00:00";
  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error("offset_unavailable");
  }
  return `${match[1]}${match[2].padStart(2, "0")}:${(match[3] ?? "00").padStart(2, "0")}`;
}
