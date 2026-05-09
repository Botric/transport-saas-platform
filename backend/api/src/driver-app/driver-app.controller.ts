import {
  Controller, Post, Get, Patch, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { DriverAppService } from './driver-app.service';
import {
  ActivateDto, DriverDetailsDto,
  CreateActivationCodeDto, UpdateActivationCodeDto,
  CreateVehicleRegistrationDto, UpdateVehicleRegistrationDto,
} from './driver-app.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('driver-app')
export class DriverAppController {
  constructor(private readonly driverAppService: DriverAppService) {}

  // ─── Driver App (no JWT needed) ──────────────────────────────────────────

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
  @Get('routes/:routeId/stop-etas')
  getStopEtas(
    @Param('routeId') routeId: string,
    @Query('departureId') departureId?: string,
  ) {
    return this.driverAppService.getStopEtas(routeId, departureId);
  }
  // ─── Admin endpoints (JWT required) ─────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('activation-codes')
  listActivationCodes() {
    return this.driverAppService.listActivationCodes();
  }

  @UseGuards(JwtAuthGuard)
  @Post('activation-codes')
  createActivationCode(@Body() dto: CreateActivationCodeDto) {
    return this.driverAppService.createActivationCode(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('activation-codes/:id')
  updateActivationCode(@Param('id') id: string, @Body() dto: UpdateActivationCodeDto) {
    return this.driverAppService.updateActivationCode(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vehicle-registrations')
  createVehicleRegistration(@Body() dto: CreateVehicleRegistrationDto) {
    return this.driverAppService.createVehicleRegistration(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('vehicle-registrations/:id')
  updateVehicleRegistration(@Param('id') id: string, @Body() dto: UpdateVehicleRegistrationDto) {
    return this.driverAppService.updateVehicleRegistration(id, dto);
  }
}
