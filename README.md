# Sunset viewer

## Description

The sunset viewer is a web application. It shows the time when you must leave your position. You then arrive at the destination at sunset.

The destination is Boston HarborWalk, City Point, South Boston. The latitude is 42.33080962456029. The longitude is -71.01528167817459.

Sunset is the time when the top edge of the sun is on the horizon. The application uses the SunCalc sunset time at the destination. If that time is in the past, the application uses the next sunset. The time zone is America/New_York. The leave time equals the sunset time minus the drive time. The application adds no extra minutes.

The drive time is the time for a car from your position to the destination. OSRM supplies that time. The server gets the time. The browser does not get the time. If OSRM cannot supply a duration, the screen shows an error. The application does not show a false duration.

This version does not send a phone notification. This version is a web application. It is not a Swift program.

## Start the application

1. Open a terminal in `/home/jkw/Projects/sunset-viewer`.
2. Operate `npm install`.
3. Operate `npm run dev`.
4. Open `http://localhost:3000` in the browser.
5. Select Continue.
6. Select `Use my location`.
7. Give the browser permission to read your position.

CAUTION: Give location permission only on a device that you control. The browser sends your position to the server.

## Make sure that the pages are correct

1. Make sure that the page shows `42.33080962456029`.
2. Make sure that the page shows `Use my location`.
3. Operate `npm run build`.
4. If the build stops, read the log.

## Files

`app/go/page.tsx` shows the destination and the location control.
`app/api/leave-by/route.ts` returns the leave time.
`lib/contract.ts` keeps the destination coordinates.
`lib/sun/sunset.ts` gets the sunset time.
`lib/route/osrm.ts` gets the drive time.

CAUTION: Do not commit `.env.local`. That file can contain a token.

## Compliance

No tool can guarantee ASD-STE100 compliance. Final approval rests with the writer. The official standard is a free download at asd-ste100.org.
