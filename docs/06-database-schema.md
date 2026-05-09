# Database Schema

## Database

Recommended:

```text
PostgreSQL
PostGIS extension
```

## Main Tables

```text
organisations
users
roles
user_roles
regions
routes
route_stops
route_departures
driver_activation_codes
vehicle_registrations
driver_sessions
tracking_points
capacity_updates
passenger_profiles
ticket_products
ticket_product_routes
ticket_orders
ticket_order_items
payments
api_keys
audit_logs
```

## organisations

Stores companies, customers, suppliers or platform tenants.

Fields:

```text
id
name
type
status
created_at
updated_at
```

## users

Stores web portal and passenger app users.

```text
id
organisation_id
name
email
phone
password_hash
status
created_at
updated_at
```

## roles

Stores portal roles/profiles.

```text
id
name
description
permissions_json
created_at
updated_at
```

## regions

Stores route groupings.

```text
id
organisation_id
name
description
status
created_at
updated_at
```

## routes

Stores route records.

```text
id
organisation_id
region_id
route_code
route_name
description
status
ticket_required
visible_to_passengers
created_at
updated_at
```

## route_stops

Stores ordered stops for each route.

```text
id
route_id
stop_order
stop_name
address
lat
lon
planned_arrival_offset_minutes
planned_departure_offset_minutes
status
created_at
updated_at
```

## route_departures

Stores scheduled departure times for each route.

```text
id
route_id
departure_time
operating_days_json
valid_from
valid_to
status
created_at
updated_at
```

Example operating days:

```json
{
  "mon": true,
  "tue": true,
  "wed": true,
  "thu": true,
  "fri": true,
  "sat": false,
  "sun": false
}
```

## driver_activation_codes

Stores codes used to activate driver apps.

```text
id
organisation_id
region_id
supplier_id
code
status
expires_at
max_uses
used_count
created_by_user_id
created_at
updated_at
```

## vehicle_registrations

Stores prefilled vehicle regs.

```text
id
organisation_id
region_id
supplier_id
registration
vehicle_name
capacity
status
created_at
updated_at
```

## driver_sessions

Stores live and historic driver route sessions.

```text
id
organisation_id
activation_code_id
route_id
departure_id
driver_name
vehicle_registration
device_id
status
started_at
ended_at
last_lat
last_lon
last_tracking_at
last_capacity_level
created_at
updated_at
```

Status options:

```text
planned
active
paused
completed
cancelled
failed
```

## tracking_points

Stores GPS history.

```text
id
driver_session_id
lat
lon
speed
heading
accuracy
battery_level
device_timestamp
server_timestamp
created_at
```

For scale, this table may later need partitioning by date.

## capacity_updates

Stores capacity changes.

```text
id
driver_session_id
capacity_level
capacity_percent
updated_by
device_timestamp
server_timestamp
created_at
```

Capacity levels:

```text
empty
low
medium
high
full
unknown
```

## passenger_profiles

Stores passenger app preferences.

```text
id
user_id
default_region_id
default_route_id
default_stop_id
passenger_type
created_at
updated_at
```

## ticket_products

Stores ticket types.

```text
id
organisation_id
name
description
ticket_type
price
currency
is_free
requires_payment
validity_type
valid_from
valid_to
status
created_at
updated_at
```

Ticket types:

```text
single
return
day
weekly
monthly
multi_route
free_pass
```

## ticket_product_routes

Links tickets to one or many routes.

```text
id
ticket_product_id
route_id
created_at
```

## ticket_orders

Stores passenger ticket orders.

```text
id
user_id
order_reference
total_amount
currency
payment_status
order_status
created_at
updated_at
```

Payment status:

```text
not_required
pending
paid
failed
refunded
cancelled
```

## ticket_order_items

Stores individual tickets in an order.

```text
id
ticket_order_id
ticket_product_id
route_id
ticket_code
qr_payload
valid_from
valid_to
status
created_at
updated_at
```

## payments

Stores payment data.

```text
id
ticket_order_id
provider
provider_payment_id
amount
currency
status
created_at
updated_at
```

## api_keys

Stores third-party API access.

```text
id
organisation_id
name
key_hash
permissions_json
region_restrictions_json
route_restrictions_json
status
expires_at
created_at
updated_at
```

## audit_logs

Stores user/admin actions.

```text
id
organisation_id
user_id
action
entity_type
entity_id
before_json
after_json
ip_address
created_at
```

## Database Task List

- [ ] Create schema migration system
- [ ] Create organisation table
- [ ] Create users and roles tables
- [ ] Create regions table
- [ ] Create routes table
- [ ] Create route stops table
- [ ] Create route departures table
- [ ] Create driver activation codes table
- [ ] Create vehicle registrations table
- [ ] Create driver sessions table
- [ ] Create tracking points table
- [ ] Create capacity updates table
- [ ] Create passenger profiles table
- [ ] Create ticket products table
- [ ] Create ticket route linking table
- [ ] Create ticket orders table
- [ ] Create payments table
- [ ] Create API keys table
- [ ] Create audit logs table
- [ ] Add indexes for live tracking
- [ ] Add indexes for route/departure lookups
- [ ] Add PostGIS location indexes
