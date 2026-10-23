# Sunset viewer handoff

One app. Absolute path: /home/jkw/Projects/sunset-viewer

Orchestrator pane is w5:p1 (tab "1 main"). Do not prompt it. Do not take its work.

This file is the contract. A later message from the orchestrator overrides it only when that message names your pane.

## Product

v1 is a phone-friendly web app so it can go on Vercel now. Swift and SwiftUI are later. Do not create an Xcode project, a .swift file, or a second app.

Push notifications are the later product. Do not build them in this pass.

The user must be able to grant location and see exactly when to leave their current position so they arrive at the target at the optimal sunset time.

## Target

Coordinates are the source of truth. Do not round them.

lat 42.33080962456029
lon -71.01528167817459

Place label, display only: Boston HarborWalk, City Point, South Boston. If a geocoder disagrees, keep the coordinates and say so. Do not change the target.

## Optimal sunset

Optimal sunset is the standard sunset instant at the target: SunCalc.getTimes(date, lat, lon).sunset. That is the sun's upper limb on the horizon. Do not use golden hour, dusk, or a custom offset.

Timezone: America/New_York.

If today's sunset at the target is already past, use the next one (tomorrow in that timezone). The response must name which calendar date.

Leave time is that instant minus driving duration. No extra buffer. Mode is driving only.

Travel time comes from OSRM, server-side only:

https://router.project-osrm.org/route/v1/driving/{originLon},{originLat};-71.01528167817459,42.33080962456029?overview=false

Longitude first. If OSRM fails, return an error. Do not invent a duration.

## API contract

Integration owns lib/contract.ts. Frontend and backend import it. They must not edit it.

POST /api/leave-by
Request JSON: {"origin":{"lat":number,"lon":number}}
Success JSON:
{
  "target":{"lat":42.33080962456029,"lon":-71.01528167817459,"label":"Boston HarborWalk, City Point, South Boston"},
  "optimal_sunset":"ISO-8601 with numeric offset",
  "sunset_date":"YYYY-MM-DD in America/New_York",
  "travel_seconds":number,
  "leave_at":"ISO-8601 with numeric offset",
  "mode":"driving",
  "timezone":"America/New_York"
}

Errors: 400 if origin is missing or out of range. 502 if OSRM fails, with {"error":"route_unavailable"}.

## Owners

Orchestrator (w5:p1, tab 1 main): no code, no deploy, no commit.

Integration (w5:p6, tab 6 integration): the single Next.js app shell. Owns package.json, next.config.ts, app/layout.tsx, app/page.tsx, app/globals.css, lib/contract.ts. Scaffolds once. Home page links to /go. Does not implement sunset math, the location screen, or the API. Does not deploy, commit, or push.

Frontend (w5:p3, tab 3 front end): app/go/** and components/go/** only. Location request and the leave-by screen. Calls POST /api/leave-by. Does not compute sunset or travel time. Does not edit the shell, the API, or lib/contract.ts. Does not deploy, commit, or push. Does not run create-next-app.

Backend (w5:p4, tab 4 backend): app/api/**, lib/sun/**, lib/route/** only. Sunset math and OSRM. Does not edit the shell, app/go, components/go, or lib/contract.ts. Does not deploy, commit, or push. Does not run create-next-app. If a dependency is required, write the package name in status/backend-deps.txt and stop. Integration installs it.

Vercel (w5:p2, tab 2 vercel): remote project and deploy only. Scope jared-werbas-projects. Project name sunset-viewer. CLI is 64.2.0: use vercel project create, never vercel project add. Set framework to nextjs before any deploy. Does not edit feature source. Does not git commit or git push. Does not production-deploy until every status file first line is DONE and the orchestrator sends a deploy prompt.

## Status

Each owner writes only their own file. First line is the signal.

status/integration.txt
status/frontend.txt
status/backend.txt
status/vercel.txt

First line stays BUILDING until that owner has done the check below. Only that owner writes DONE. The orchestrator does not write DONE.

Integration DONE: package.json exists, app/page.tsx links to /go, lib/contract.ts matches this file, npm run build passes. A missing /go page is acceptable.

Frontend DONE: production build HTML for /go contains the unbroken phrase "Use my location" and the unbroken coordinate text 42.33080962456029.

Backend DONE: a local node check prints a leave-by result for origin 42.3601,-71.0589 using the real sun library and a live or recorded OSRM duration. Do not mark DONE on a stub duration.

Vercel DONE: only after a production deploy the orchestrator asked for, and vercel project inspect shows Framework Preset Next.js. Creating the project is not DONE. Write the project id on line 2 when the project exists. Keep line 1 as BUILDING until the deploy check.

## Hard stops

One app. If package.json already exists, do not create another.
Do not edit another owner's tree.
Do not deploy, commit, or push unless you are the Vercel pane and the orchestrator has asked you to deploy.
Do not put secrets in prompts, client code, or git.
Phone screen: large type, one primary action, safe-area padding, min tap height 44px. Body text at least 17px.
