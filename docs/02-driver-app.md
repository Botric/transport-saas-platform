# Driver Android App

## Objective

The Driver Android App allows a driver to activate the app, select their vehicle, select the route they are operating, choose a departure time, and send live tracking and capacity information back to the platform.

The first major project goal is to produce a working Android APK.

## Driver App First-Launch Flow

```text
Open app
→ Enter activation code
→ Validate code with backend
→ Select or enter UK vehicle registration
→ Enter driver name
→ Select region
→ Select route
→ Select departure time
→ Start journey
```

## Activation Code Logic

Activation codes are managed from the Web Portal.

A code can be:

- One-time use
- Multi-use
- Expiring after a date/time
- Locked to a region
- Locked to an organisation
- Locked to a supplier
- Disabled by admin

### Activation Code Fields

| Field | Description |
|---|---|
| code | Human-friendly code entered by driver |
| status | Active, used, expired, disabled |
| organisationId | Owning organisation |
| regionId | Optional region restriction |
| supplierId | Optional supplier restriction |
| expiresAt | Optional expiry |
| maxUses | Number of allowed uses |
| usedCount | Number of times used |
| createdBy | Admin user who created it |

## Vehicle Registration

After activation, the driver must enter the vehicle registration.

The app should support:

1. Prefilled vehicle list from portal
2. Manual user entry
3. UK registration validation only

### Vehicle Entry Options

| Option | Description |
|---|---|
| Prefilled list | Admin-managed list of vehicle regs |
| Manual entry | Driver types a UK registration |
| Recently used | App remembers previous reg for that device/session |

### UK Vehicle Reg Validation

The app should:

- Convert to uppercase
- Remove extra spaces
- Allow UK-style registrations only
- Reject empty values
- Show user-friendly error if invalid

Example valid formats:

```text
AB12 CDE
A123 BCD
AB123
ABC 123D
```

The backend should still validate again server-side.

## Driver Name

The app should collect:

- Driver first name
- Driver surname or full name
- Optional phone number
- Optional supplier/company name

For MVP, use a single field:

```text
Driver Name
```

## Region Selection

The driver selects a region after entering vehicle and name.

Example regions:

- North West
- Yorkshire
- Midlands
- London
- Scotland
- South Wales
- Custom contract area

The app should only show regions available to the activation code or organisation.

## Route Selection

After selecting a region, the driver selects a route.

Routes should be filtered by:

- Region
- Active status
- Valid operating day
- Optional supplier restrictions
- Optional vehicle restrictions

Example:

```text
Region: Manchester
Routes:
- MCR-001 - Trafford Park Shuttle
- MCR-002 - School AM Route
- MCR-003 - School PM Route
```

## Departure Time Selection

By default, only departure times within the next hour should show.

There should be a **View More** button to show later times.

### Default Logic

```text
Show departures where:
currentTime <= departureTime <= currentTime + 1 hour
```

### View More Logic

When selected, show:

- Remaining departures today
- Optional tomorrow departures
- Optional all scheduled departures

## Journey Start

When the driver selects a departure, the app creates a driver session.

Driver session includes:

- Driver name
- Vehicle reg
- Region
- Route
- Departure time
- Device ID
- Activation code used
- Start timestamp
- Location status

## Driver Journey Screen

The journey screen should show:

- Route name
- Departure time
- Current status
- Next stop
- Route stop list
- Map
- Capacity controls
- Start/stop tracking
- Incident/report button
- End journey button

## Capacity Update

The driver should be able to update how full the bus is.

Options for MVP:

```text
Empty
Low
Medium
High
Full
```

Or percentage:

```text
0%, 25%, 50%, 75%, 100%
```

Recommended MVP: use simple levels first.

## GPS Tracking

When journey is active, the app should send:

| Field | Description |
|---|---|
| sessionId | Active driver session |
| vehicleReg | Vehicle registration |
| driverName | Driver name |
| routeId | Selected route |
| departureId | Selected departure |
| lat | Latitude |
| lon | Longitude |
| speed | GPS speed |
| heading | Direction |
| accuracy | GPS accuracy |
| timestamp | Device timestamp |
| batteryLevel | Optional |
| capacityLevel | Latest capacity level |

## Tracking Frequency

Recommended MVP:

| State | Frequency |
|---|---|
| Journey not active | No GPS tracking |
| Journey active | Every 15 seconds |
| App background active | Every 30 seconds |
| Arrival/departure event | Immediate |

## Offline Behaviour

The app should queue events when offline:

- GPS points
- Capacity updates
- Start journey
- End journey

When online again, the app uploads queued events.

## Android Permissions

The app will need:

- Fine location
- Background location
- Internet access
- Foreground service
- Notifications

## Driver App Screens

1. Splash screen
2. Activation code screen
3. Vehicle registration screen
4. Driver name screen
5. Region selection screen
6. Route selection screen
7. Departure selection screen
8. Active journey screen
9. Capacity update screen/modal
10. End journey confirmation
11. Error/offline screen

## Driver App Task List

### Phase 1 — APK Skeleton

- [ ] Create Android project
- [ ] Create app package name
- [ ] Add splash screen
- [ ] Add basic navigation
- [ ] Create environment config for API URL
- [ ] Build debug APK
- [ ] Upload project to GitHub

### Phase 2 — Activation

- [ ] Create activation code screen
- [ ] Add API call to validate activation code
- [ ] Store activation token locally
- [ ] Handle invalid code
- [ ] Handle expired code
- [ ] Handle offline activation error

### Phase 3 — Vehicle and Driver Details

- [ ] Fetch prefilled vehicle registrations from API
- [ ] Add dropdown/search vehicle reg selection
- [ ] Add manual vehicle reg entry
- [ ] Add UK reg validation
- [ ] Add driver name field
- [ ] Save session details locally

### Phase 4 — Region, Route and Departure

- [ ] Fetch regions from API
- [ ] Fetch routes by selected region
- [ ] Fetch departures by selected route
- [ ] Default show departures in next hour
- [ ] Add View More button
- [ ] Allow driver to select departure
- [ ] Create driver session in backend

### Phase 5 — Tracking

- [ ] Request location permissions
- [ ] Create foreground tracking service
- [ ] Send GPS location every 15 seconds
- [ ] Add background tracking support
- [ ] Add offline queue
- [ ] Add retry upload logic

### Phase 6 — Capacity and Journey Events

- [ ] Add capacity level buttons
- [ ] Send capacity updates to API
- [ ] Add Start Journey button
- [ ] Add End Journey button
- [ ] Add incident/report issue button
- [ ] Show active route information

### Phase 7 — APK Release

- [ ] Add app icon
- [ ] Add release signing config
- [ ] Build signed APK
- [ ] Test on real Android device
- [ ] Document installation process
