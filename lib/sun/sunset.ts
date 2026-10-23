import { getTimes } from "suncalc";
import { TARGET, TIMEZONE } from "../contract";
import { addCalendarDays, calendarDate, zonedNoon } from "./time";

export function optimalSunset(now: Date = new Date()): { instant: Date; sunsetDate: string } {
  const today = calendarDate(now, TIMEZONE);
  const todaySunset = sunsetOn(today);
  if (todaySunset.getTime() < now.getTime()) {
    const tomorrow = addCalendarDays(today, 1);
    const next = sunsetOn(tomorrow);
    return { instant: next, sunsetDate: calendarDate(next, TIMEZONE) };
  }
  return { instant: todaySunset, sunsetDate: calendarDate(todaySunset, TIMEZONE) };
}

function sunsetOn(ymd: string): Date {
  const noon = zonedNoon(ymd, TIMEZONE);
  const sunset = getTimes(noon, TARGET.lat, TARGET.lon).sunset;
  if (sunset == null || Number.isNaN(sunset.getTime())) {
    throw new Error("sunset_unavailable");
  }
  if (calendarDate(sunset, TIMEZONE) !== ymd) {
    throw new Error("sunset_date_mismatch");
  }
  return sunset;
}
