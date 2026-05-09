# Ticketing and Orders

## Objective

The platform should support ticketing for passenger routes.

Tickets can be:

- Paid
- Free
- Required
- Optional
- Not required

A ticket can be valid for:

- One route
- Multiple routes
- One region
- Multiple regions
- A single journey
- A day
- A week
- A month
- A custom date range

## Route Ticket Rules

Each route should have a setting:

| Setting | Description |
|---|---|
| No ticket required | Passenger can view/use route without ticket |
| Ticket optional | Passenger can buy/claim but not required |
| Ticket required | Passenger must hold valid ticket |
| Free ticket required | User must claim free ticket |
| Paid ticket required | User must purchase valid ticket |

## Ticket Product Fields

| Field | Description |
|---|---|
| name | Ticket name |
| description | Passenger-facing description |
| routeIds | One or many routes |
| regionIds | Optional region validity |
| price | Price |
| isFree | True/false |
| requiresPayment | True/false |
| validityType | Single/day/week/month/custom |
| visible | Show in passenger app |
| maxUses | Optional use limit |
| status | Active/inactive |

## Free Tickets

Free tickets should still create an order.

Payment status should be:

```text
not_required
```

This keeps records consistent and allows the passenger to view previous free claims.

## Paid Tickets

Paid tickets should use a payment provider.

Suggested provider:

```text
Stripe
```

Payment flow:

```text
Select ticket
→ Create order
→ Create payment intent
→ User pays
→ Confirm payment
→ Issue ticket
→ Show ticket in app
```

## Ticket Validity

Example validity types:

| Type | Description |
|---|---|
| Single | One journey |
| Day | Valid for a day |
| Weekly | Valid for 7 days |
| Monthly | Valid for month |
| Date range | Custom dates |
| Route pass | Valid while account active |

## Ticket Display

A ticket should show:

- Ticket name
- Route validity
- Valid from
- Valid to
- Passenger name
- QR code/barcode
- Ticket code
- Status

## Ticket QR Payload

Example:

```json
{
  "ticketCode": "TCK-ABC123",
  "orderRef": "ORD-10001",
  "userId": "user_001",
  "validFrom": "2026-05-09T00:00:00Z",
  "validTo": "2026-05-09T23:59:59Z"
}
```

## Previous Orders

Passenger can view:

- Order reference
- Ticket name
- Date purchased/claimed
- Amount
- Status
- Receipt
- Ticket code

## Finance Reporting

Finance users should see:

- Gross sales
- Free tickets claimed
- Paid tickets sold
- Failed payments
- Refunds
- Route revenue
- Ticket product revenue
- Exportable order data

## Ticketing Task List

### Phase 1 — Ticket Products

- [ ] Create ticket product table
- [ ] Create ticket product API
- [ ] Create ticket product WebUI page
- [ ] Add free ticket option
- [ ] Add paid ticket option
- [ ] Link ticket to one route
- [ ] Link ticket to many routes

### Phase 2 — Passenger Orders

- [ ] Create order table
- [ ] Create free ticket order flow
- [ ] Show previous orders
- [ ] Show active ticket
- [ ] Generate ticket code
- [ ] Generate QR payload

### Phase 3 — Payments

- [ ] Add payment provider integration
- [ ] Create payment intent
- [ ] Confirm payment
- [ ] Mark order paid
- [ ] Handle payment failure
- [ ] Handle refunds

### Phase 4 — Finance

- [ ] Create finance dashboard
- [ ] Add order exports
- [ ] Add revenue report by route
- [ ] Add revenue report by ticket product
- [ ] Add free ticket claim report
