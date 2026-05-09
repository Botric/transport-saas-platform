import { Controller, Get, Param, Query } from '@nestjs/common';
import { PassengerService } from './passenger.service';

@Controller('passenger')
export class PassengerController {
  constructor(private readonly passengerService: PassengerService) {}

  @Get('regions')
  getRegions() {
    return this.passengerService.getRegions();
  }

  @Get('regions/:regionId/routes')
  getRoutes(@Param('regionId') regionId: string) {
    return this.passengerService.getRoutes(regionId);
  }

  @Get('routes/:routeId/departures')
  getDepartures(@Param('routeId') routeId: string, @Query() _q: Record<string, string>) {
    return this.passengerService.getDepartures(routeId);
  }

  @Get('routes/:routeId/live')
  getLive(@Param('routeId') routeId: string) {
    return this.passengerService.getLive(routeId);
  }
}
