import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DriverAppService } from './driver-app.service';
import { ActivateDto, DriverDetailsDto } from './driver-app.dto';

@Controller('driver-app')
export class DriverAppController {
  constructor(private readonly driverAppService: DriverAppService) {}

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  activate(@Body() dto: ActivateDto) {
    return this.driverAppService.activate(dto);
  }

  @Get('vehicles')
  getVehicles(@Query('regionId') regionId?: string) {
    return this.driverAppService.getVehicles(regionId);
  }

  @Post('driver-details')
  @HttpCode(HttpStatus.OK)
  submitDriverDetails(@Body() dto: DriverDetailsDto) {
    return this.driverAppService.submitDriverDetails(dto);
  }

  @Get('regions')
  getRegions() {
    return this.driverAppService.getRegions();
  }

  @Get('regions/:regionId/routes')
  getRoutes(@Param('regionId') regionId: string) {
    return this.driverAppService.getRoutesByRegion(regionId);
  }

  @Get('routes/:routeId/departures')
  getDepartures(@Param('routeId') routeId: string, @Query('window') window?: string) {
    return this.driverAppService.getDepartures(routeId, window);
  }
}
