# Ticketing

## Overview

The ticketing system handles free ticket claiming, paid orders, QR code display, and driver-side boarding validation.

---

## Ticket Products

Ticket products are created by admins in the web portal under **Tickets**.

| Field | Description |
|---|---|
| name | Product name (e.g. "School Route Single") |
| price | `0.00` = free. Paid products require payment integration (not yet wired to a gateway) |
| currency | `GBP` |
| validityType | `single`, `day`, `week`, `month` |
| routeId | Optional — restrict to a specific route |
| regionId | Optional — restrict to a specific region |
| isActive | Whether passengers can see and claim/buy it |

---

## Ticket Orders

A ticket order is created when a passenger claims or purchases a ticket. Each order has:

| Field | Description |
|---|---|
| ticketCode | Random 8-character alphanumeric code — used for QR |
| status | `active`, `used`, `expired`, `cancelled` |
| validFrom | Start of validity window |
| validUntil | End of validity window |
| boardedAt | Timestamp set when the driver validates the ticket |
| boardedSessionId | Driver session that validated the ticket |

---

## Claiming a Free Ticket (Passenger App)

### Step 1 — View available products

```
GET /ticketing/public/products
```

Returns all active products for the passenger's region/route.

### Step 2 — Claim

```
POST /ticketing/my/claim
Authorization: Bearer <passenger-jwt>
Body: { "productId": "uuid" }
```

Response:
```json
{
  "id": "uuid",
  "ticketCode": "AB12CD34",
  "status": "active",
  "validFrom": "2025-01-20T00:00:00Z",
  "validUntil": "2025-01-20T23:59:59Z",
  "product": { "name": "School Route Single", "validityType": "single" }
}
```

### Step 3 — Display QR code

The passenger app renders the `ticketCode` as a QR code canvas using the `qrcode` library.

```ts
import QRCode from 'qrcode';
await QRCode.toCanvas(canvasElement, ticketCode, { width: 220 });
```

---

## Boarding Validation (Driver Side)

When the driver scans a QR code, the driver device calls:

```
POST /ticketing/validate
Body: {
  "ticketCode": "AB12CD34",
  "sessionId": "driver-session-uuid"
}
```

### Validation Logic

1. Find the ticket order by `ticketCode`.
2. Check status is `active`.
3. Check `validFrom` and `validUntil` window.
4. Check the `sessionId` is a real active driver session (prevents brute-force).
5. Mark ticket `status = used`, set `boardedAt` and `boardedSessionId`.

### Success Response

```json
{
  "valid": true,
  "message": "Ticket accepted",
  "ticketCode": "AB12CD34",
  "passenger": "Jane Smith"
}
```

### Error Responses

```json
{ "valid": false, "message": "Ticket not found" }
{ "valid": false, "message": "Ticket already used" }
{ "valid": false, "message": "Ticket expired" }
{ "valid": false, "message": "Invalid session" }
```

---

## Finance Orders (Admin)

The web portal **Finance** page shows all ticket orders:

- Passenger name and email
- Product name
- Price and currency
- Status
- Valid from / until
- Boarded at (if validated)

Admins can download all orders as a CSV from the **Reports** page:

```
GET /reports/finance
Authorization: Bearer <admin-jwt>
```

---

## Partner API Access

Partners can access finance data using an API key:

```
GET /partner/finance
X-API-Key: <plain-api-key>
```

---

## Ticket Validity Windows

| validityType | Window |
|---|---|
| `single` | Same calendar day as claim |
| `day` | 24 hours from claim |
| `week` | 7 days from claim |
| `month` | 30 days from claim |
