import { NextResponse } from "next/server";
import type { LeaveByError } from "@/lib/contract";
import { computeLeaveBy, parseOrigin, RouteUnavailable } from "@/lib/route/leave-by";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_origin" } satisfies LeaveByError, { status: 400 });
  }

  const origin = parseOrigin(body);
  if (!origin) {
    return NextResponse.json({ error: "bad_origin" } satisfies LeaveByError, { status: 400 });
  }

  try {
    const result = await computeLeaveBy(origin);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RouteUnavailable) {
      return NextResponse.json({ error: "route_unavailable" } satisfies LeaveByError, { status: 502 });
    }
    throw error;
  }
}
