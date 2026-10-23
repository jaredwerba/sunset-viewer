export type Origin = { lat: number; lon: number };

export const TARGET = {
  lat: 42.33080962456029,
  lon: -71.01528167817459,
  label: "Boston HarborWalk, City Point, South Boston",
} as const;

export const TIMEZONE = "America/New_York";

export type LeaveBySuccess = {
  target: { lat: number; lon: number; label: string };
  optimal_sunset: string;
  sunset_date: string;
  travel_seconds: number;
  leave_at: string;
  mode: "driving";
  timezone: "America/New_York";
};

export type LeaveByError = { error: "bad_origin" | "route_unavailable" };
