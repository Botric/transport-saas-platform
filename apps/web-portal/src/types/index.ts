export interface User {
  id: string;
  name: string;
  email: string;
  organisationId?: string;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  organisationId?: string;
}

export interface Route {
  id: string;
  regionId: string;
  routeCode: string;
  routeName: string;
  description?: string;
  status: string;
  ticketRequired: boolean;
  visibleToPassengers: boolean;
}

export interface Departure {
  id: string;
  routeId: string;
  departureTime: string;
  operatingDays: {
    mon: boolean; tue: boolean; wed: boolean;
    thu: boolean; fri: boolean; sat: boolean; sun: boolean;
  };
  validFrom?: string;
  validTo?: string;
  status: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  status: string;
  organisationId?: string;
  regionId?: string;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
}

export interface VehicleRegistration {
  id: string;
  registration: string;
  vehicleName?: string;
  capacity?: number;
  regionId?: string;
  status: string;
}

export interface DriverSession {
  id: string;
  driverName: string;
  vehicleRegistration: string;
  status: string;
  startedAt?: string;
  lastLat?: number;
  lastLon?: number;
  lastTrackingAt?: string;
  lastCapacityLevel?: string;
  route?: Route;
}
