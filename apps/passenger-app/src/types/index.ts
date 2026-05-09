export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface Route {
  id: string;
  regionId: string;
  routeCode: string;
  routeName: string;
  description?: string;
  ticketRequired: boolean;
  status: string;
}

export interface Departure {
  id: string;
  departureTime: string;
  operatingDays: {
    mon: boolean; tue: boolean; wed: boolean;
    thu: boolean; fri: boolean; sat: boolean; sun: boolean;
  };
  status: string;
}

export interface LiveSession {
  id: string;
  vehicleRegistration: string;
  lastLat: number | null;
  lastLon: number | null;
  lastTrackingAt: string | null;
  lastCapacityLevel: string | null;
}

export interface LiveData {
  session: LiveSession | null;
  nextDeparture: {
    id: string;
    departureTime: string;
    delayMinutes: number | null;
  } | null;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
}

export interface Prefs {
  regionId: string;
  regionName: string;
  routeId: string;
  routeName: string;
  routeCode: string;
}

export interface TicketProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  isFree: boolean;
  validityType: string;
  routes: Route[];
}

export interface MyTicket {
  id: string;
  ticketCode: string;
  paymentStatus: string;
  amountPaid: number;
  validFrom?: string;
  validUntil?: string;
  status: string;
  createdAt: string;
  ticketProduct?: TicketProduct;
}
