# Open Questions

These are the items that should be confirmed before development.

## Android Apps

- [ ] Should the passenger app also be a native Android APK, or should it start as a web/PWA app?
- [ ] Should the driver app use only activation codes, or should named driver accounts be added later?
- [ ] Should a driver activation code be one-time only or reusable?
- [ ] Should the app remember the driver name and vehicle reg after first use?
- [ ] Should the driver be able to change vehicle reg mid-journey?

## Routes

- [ ] Are routes fixed timetable routes, flexible routes, or both?
- [ ] Should routes have stops, or just origin/destination for MVP?
- [ ] Should routes be public to all passengers in a region?
- [ ] Should routes be hidden unless assigned to a passenger account?
- [ ] Should departures be generated daily or stored as timetable templates?

## Passenger App

- [ ] Can passengers see all routes in a region?
- [ ] Can passengers change route themselves?
- [ ] Should passengers be able to select a default stop?
- [ ] Should passengers be able to report absence or cancel travel?
- [ ] Should passengers see exact vehicle reg/driver name?

## Ticketing

- [ ] Which payment provider should be used?
- [ ] Should free tickets still require an order record?
- [ ] Should tickets use QR codes?
- [ ] Should the driver app validate tickets?
- [ ] Should a ticket be shareable across multiple passengers?

## Web Portal

- [ ] Do organisations need separate branding?
- [ ] Do suppliers need their own portal?
- [ ] Should finance users see all routes or restricted regions only?
- [ ] Should API access be sold per customer?
- [ ] Should reports export to Excel?

## Tracking

- [ ] How often should driver GPS send data?
- [ ] Should background tracking continue if the app is closed?
- [ ] How long should GPS history be retained?
- [ ] Should passengers see exact bus location or approximate location?
- [ ] Should capacity be manually set by driver or calculated from ticket use?

## Hosting

- [ ] Should this be hosted on your own server first?
- [ ] Should Docker/Podman be used from day one?
- [ ] Should PostgreSQL run in the same container stack?
- [ ] Should GitHub Actions build APKs automatically later?
